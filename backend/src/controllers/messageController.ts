import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import { io, getReceiverSocketIds } from "../socket/socket.js";

export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const friendId = req.params.friendId as string;
    // clientMessageId is the frontend's optimistic id. echoed back in the
    // response + socket emit so the sender's tabs can swap optimistic for real
    const { text, clientMessageId } = req.body;

    // Validate input
    if (!text) return next(new AppError("Message text is required", 400));
    if (userId === friendId)
      return next(new AppError("Can't text to yourself", 400));

    // Check friendship and find existing conversation in parallel
    const [isFriend, existingConversation] = await Promise.all([
      prisma.friendConnection.findFirst({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: userId, addresseeId: friendId },
            { requesterId: friendId, addresseeId: userId },
          ],
        },
      }),

      prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: friendId } } },
          ],
        },
      }),
    ]);

    if (!isFriend) return next(new AppError("Not your friend", 404));

    // wrap conversation create + message create in a tx so a failed write 2
    // doesn't leave an empty orphan conversation sitting around forever
    const message = await prisma.$transaction(async (tx) => {
      let convo = existingConversation;
      if (!convo) {
        convo = await tx.conversation.create({
          data: {
            participants: {
              createMany: { data: [{ userId }, { userId: friendId }] },
            },
          },
        });
      }
      return tx.message.create({
        data: { text, userId, conversationId: convo.id },
      });
    });

    // emit to BOTH sides. sender's other tabs need to see the new message,
    // and the sending tab itself uses clientMessageId to swap optimistic
    // for the real DB row (real id, real createdAt)
    const payload = { ...message, clientMessageId: clientMessageId ?? null };
    const targetSocketIds = [
      ...getReceiverSocketIds(friendId),
      ...getReceiverSocketIds(userId),
    ];
    for (const sockId of targetSocketIds) {
      io.to(sockId).emit("newMessage", payload);
    }

    res.status(201).json({
      status: "success",
      data: { message: payload },
    });
  },
);

export const getConversations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    // Find conversations where logged-in user is a participant
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        // Get only the other person's info - exclude yourself from participants
        participants: {
          where: { userId: { not: userId } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true,
                lastSeenAt: true,
              },
            },
          },
        },
        // Get the last message only - used for chat preview in sidebar
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Sort by most-recent activity: the last message's time, falling back to
    // the conversation's createdAt for a brand-new convo with no messages yet.
    // done in JS because the sort key lives on the included last message, not
    // the conversation row. fine at this scale (every convo is fetched)
    const lastActivity = (c: (typeof conversations)[number]) =>
      c.messages[0]?.createdAt ?? c.createdAt;
    conversations.sort(
      (a, b) => lastActivity(b).getTime() - lastActivity(a).getTime(),
    );

    // My lastReadAt per conversation. Separate query because Prisma can't
    // include my own participant alongside the filtered "other" one in a
    // single relation include. Indexed on (userId, conversationId).
    const myParts = await prisma.conversationParticipant.findMany({
      where: { userId, conversationId: { in: conversations.map((c) => c.id) } },
      select: { conversationId: true, lastReadAt: true },
    });
    const lastReadMap = new Map(
      myParts.map((p) => [p.conversationId, p.lastReadAt]),
    );

    // Unread = messages from the OTHER person newer than my lastReadAt. The
    // cutoff differs per conversation, so it's one groupBy with an OR clause
    // each - a single round trip, and every clause hits the
    // (conversationId, createdAt) index. epoch fallback = never-read.
    const orClauses = conversations.map((c) => ({
      conversationId: c.id,
      userId: { not: userId },
      createdAt: { gt: lastReadMap.get(c.id) ?? new Date(0) },
    }));
    const grouped = orClauses.length
      ? await prisma.message.groupBy({
          by: ["conversationId"],
          where: { OR: orClauses },
          _count: { _all: true },
        })
      : [];
    const unreadMap = new Map(
      grouped.map((g) => [g.conversationId, g._count._all]),
    );

    const conversation = conversations.map((c) => ({
      ...c,
      unreadCount: unreadMap.get(c.id) ?? 0,
    }));

    res.status(200).json({
      status: "success",
      results: conversation.length,
      data: {
        conversation,
      },
    });
  },
);

// Marks the thread read for the caller (lastReadAt = now). Clears only MY
// unread badge - there are no read receipts, so the other person never learns
// I read it. updateMany doubles as the participant check (count 0 = not mine).
export const markConversationRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;

    const result = await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    if (result.count === 0)
      return next(new AppError("Conversation not found", 404));

    res.status(204).end();
  },
);

// newest N messages loaded up front. older ones are paged in via
// getOlderMessages as the user scrolls up - keeps the open call cheap even on
// a thread with thousands of messages
const MESSAGE_PAGE_SIZE = 50;

export const getConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;

    // Find this conversation only if logged-in user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
      include: {
        // Get the other person's profile
        participants: {
          where: { userId: { not: userId } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true,
                lastSeenAt: true,
              },
            },
          },
        },
        // newest page only: take the last N by fetching desc, then reverse to
        // asc below so the client still renders oldest->newest. fetch one extra
        // to detect whether older messages exist without a second count query.
        // (createdAt desc, id desc) matches getOlderMessages so the page
        // boundary lines up exactly - no gap/overlap at the same millisecond
        messages: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: MESSAGE_PAGE_SIZE + 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) return next(new AppError("Conversation not found", 404));

    // is the other participant still an accepted friend? drives the chat UI:
    // when false the client shows a read-only thread and hides the composer.
    // sendMessage enforces the same rule server-side, so this is UX, not the
    // security boundary. unfriended convos keep their history, just no new sends
    const otherUserId = conversation.participants[0]?.user.id;
    const friendship = otherUserId
      ? await prisma.friendConnection.findFirst({
          where: {
            status: "ACCEPTED",
            OR: [
              { requesterId: userId, addresseeId: otherUserId },
              { requesterId: otherUserId, addresseeId: userId },
            ],
          },
          select: { id: true },
        })
      : null;
    const isFriend = !!friendship;

    // the +1 row, if present, just signals "there's more" - drop it, then flip
    // back to ascending order for display
    const hasMoreMessages = conversation.messages.length > MESSAGE_PAGE_SIZE;
    const page = hasMoreMessages
      ? conversation.messages.slice(0, MESSAGE_PAGE_SIZE)
      : conversation.messages;
    const ordered = { ...conversation, messages: page.reverse() };

    res.status(200).json({
      status: "success",
      data: { conversation: ordered, hasMoreMessages, isFriend },
    });
  },
);

// page older messages for the infinite-scroll-up. ?before=<messageId> returns
// the N messages immediately older than that one, newest-first reversed to asc
export const getOlderMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;
    const before = req.query.before as string | undefined;

    if (!before)
      return next(new AppError("Query parameter 'before' is required", 400));

    // membership check - don't leak another user's messages
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
      select: { id: true },
    });
    if (!isParticipant)
      return next(new AppError("Conversation not found", 404));

    // anchor on the cursor message's (createdAt, id). need id as a tiebreaker:
    // paging on createdAt alone with strict `lt` silently drops any messages
    // sharing the cursor's exact millisecond (bursts/seeds collide easily)
    const cursor = await prisma.message.findFirst({
      where: { id: before, conversationId },
      select: { createdAt: true, id: true },
    });
    if (!cursor) return next(new AppError("Message not found", 404));

    // compound cursor: strictly older by time, OR same instant but an earlier
    // id. matches the (createdAt desc, id desc) ordering below so nothing at the
    // boundary millisecond is skipped or repeated
    const older = await prisma.message.findMany({
      where: {
        conversationId,
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: MESSAGE_PAGE_SIZE + 1,
      include: {
        user: {
          select: { id: true, name: true, photo: true, lastSeenAt: true },
        },
      },
    });

    const hasMoreMessages = older.length > MESSAGE_PAGE_SIZE;
    const page = hasMoreMessages ? older.slice(0, MESSAGE_PAGE_SIZE) : older;

    res.status(200).json({
      status: "success",
      data: { messages: page.reverse(), hasMoreMessages },
    });
  },
);

export const unsendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;
    const messageId = req.params.messageId as string;

    // Delete only if message belongs to logged-in user in this conversation
    const unsend = await prisma.message.deleteMany({
      where: { id: messageId, userId, conversationId },
    });

    if (unsend.count === 0) return next(new AppError("Message not found", 404));

    res.status(204).json({});
  },
);

export const deleteConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;

    // ownership: you can only delete a thread you're actually in
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
      select: { id: true },
    });
    if (!isParticipant)
      return next(new AppError("Conversation not found", 404));

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversationId } }),
      prisma.conversationParticipant.deleteMany({ where: { conversationId } }),
      prisma.conversation.delete({ where: { id: conversationId } }),
    ]);

    res.status(204).json({});
  },
);

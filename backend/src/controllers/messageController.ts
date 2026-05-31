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
      // Show newest conversations first
      orderBy: { createdAt: "desc" },
    });

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
        // Get all messages sorted oldest first so chat reads top to bottom
        messages: {
          orderBy: { createdAt: "asc" },
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

    res.status(200).json({ status: "success", data: { conversation } });
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

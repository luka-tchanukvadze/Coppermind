import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const friendId = req.params.friendId as string;
    const { text } = req.body;

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

    let conversation = existingConversation;
    // Create conversation if first time messaging this friend
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            createMany: { data: [{ userId }, { userId: friendId }] },
          },
        },
      });
    }

    // Send the message
    const message = await prisma.message.create({
      data: { text, userId, conversationId: conversation.id },
    });

    // Emit the new message to the receiver in real time if they're online
    const receiverSocketId = getReceiverSocketId(friendId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({ status: "success", data: { message } });
  },
);

export const getConversations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    // Find conversations where logged-in user is a participant
    const conversation = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        // Get only the other person's info - exclude yourself from participants
        participants: {
          where: { userId: { not: userId } },
          include: { user: { select: { id: true, name: true, photo: true } } },
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

    res.status(200).json({
      status: "success",
      results: conversation.length,
      data: {
        conversation,
      },
    });
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
          include: { user: { select: { id: true, name: true, photo: true } } },
        },
        // Get all messages sorted oldest first so chat reads top to bottom
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, photo: true } } },
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

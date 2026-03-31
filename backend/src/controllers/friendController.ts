import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";

export const sendRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendId = req.params.friendId as string;
    const userId = req.user!.id;

    // 1. Can't send a request to  yourself
    if (userId === friendId)
      return next(new AppError("You cannot send a request to yourself", 400));

    // 2. Check if connection exists in either direction
    const existing = await prisma.friendConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
      },
    });

    if (existing)
      return next(new AppError("Friend request already exists", 400));

    // 3. Don't pass status or IDs from body - use only trusted values
    const result = await prisma.friendConnection.create({
      data: { requesterId: userId, addresseeId: friendId },
    });

    res.status(201).json({
      status: "success",
      data: { friendRequest: result },
    });
  },
);

export const getIncomingRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const result = await prisma.friendConnection.findMany({
      where: { addresseeId: userId, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, photo: true } } },
    });

    res.status(200).json({
      status: "success",
      results: result.length,
      data: { result },
    });
  },
);

export const acceptRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const friendId = req.params.friendId as string;

    const result = await prisma.friendConnection.updateMany({
      data: { status: "ACCEPTED" },
      where: { addresseeId: userId, requesterId: friendId, status: "PENDING" },
    });

    if (result.count === 0)
      return next(new AppError("No Pending request found", 404));

    res.status(200).json({
      status: "success",
      message: "Friend request accepted",
    });
  },
);

export const removeConnection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const friendId = req.params.friendId as string;

    const result = await prisma.friendConnection.deleteMany({
      where: {
        OR: [
          { addresseeId: userId, requesterId: friendId },
          { requesterId: userId, addresseeId: friendId },
        ],
      },
    });

    if (result.count === 0)
      return next(new AppError("No connection found", 404));

    res.status(204).json({});
  },
);

export const getFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const result = await prisma.friendConnection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, photo: true } },
        addressee: { select: { id: true, name: true, photo: true } },
      },
    });

    res.status(200).json({
      status: "success",
      results: result.length,
      data: { result },
    });
  },
);

export const getMutualFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const friendId = req.params.friendId as string;

    // Fetch both friend lists in parallel
    const [myConnections, theirConnections] = await Promise.all([
      prisma.friendConnection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
      }),
      prisma.friendConnection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: friendId }, { addresseeId: friendId }],
        },
      }),
    ]);

    // Extract the OTHER person's ID from each connection
    const myFriendIds = myConnections.map((c) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId,
    );
    const theirFriendIds = theirConnections.map((c) =>
      c.requesterId === friendId ? c.addresseeId : c.requesterId,
    );

    // Intersection - IDs in both sets
    const myFriendSet = new Set(myFriendIds);
    const mutualIds = theirFriendIds.filter((id) => myFriendSet.has(id));

    // Fetch user info for the mutual friends
    const mutualFriends = await prisma.user.findMany({
      where: { id: { in: mutualIds } },
      select: { id: true, name: true, photo: true },
    });

    res.status(200).json({
      status: "success",
      results: mutualFriends.length,
      data: { mutualFriends },
    });
  },
);

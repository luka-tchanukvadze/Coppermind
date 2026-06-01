import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import { invalidateRecs } from "../utils/recCache.js";
import { io, getReceiverSocketIds } from "../socket/socket.js";

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

    // 3. Don't pass status or IDs from body - use only trusted values.
    // catch P2002 from a double-tap: two requests both pass the existence
    // check above, then both insert. the unique constraint rejects the second
    // - treat it as the same "already exists" case instead of a 500
    let result;
    try {
      result = await prisma.friendConnection.create({
        data: { requesterId: userId, addresseeId: friendId },
      });
    } catch (err: any) {
      if (err?.code === "P2002")
        return next(new AppError("Friend request already exists", 400));
      throw err;
    }

    // ping the recipient's live sockets so their nav badge updates instantly,
    // no payload needed - the client just refetches incoming requests
    for (const sockId of getReceiverSocketIds(friendId)) {
      io.to(sockId).emit("friendRequest");
    }

    res.status(201).json({
      status: "success",
      data: { friendRequest: result },
    });
  },
);

export const getIncomingRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    // pull the requests + my "last opened Friends" marker together. unseenCount
    // = requests newer than that marker, which drives the nav badge (facebook-
    // style: opening Friends stamps the marker and clears the dot)
    const [result, me] = await Promise.all([
      prisma.friendConnection.findMany({
        where: { addresseeId: userId, status: "PENDING" },
        include: {
          requester: { select: { id: true, name: true, photo: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { friendRequestsSeenAt: true },
      }),
    ]);

    const seenAt = me?.friendRequestsSeenAt ?? new Date(0);
    const unseenCount = result.filter((r) => r.createdAt > seenAt).length;

    res.status(200).json({
      status: "success",
      results: result.length,
      unseenCount,
      data: { result },
    });
  },
);

// stamp "I just opened the Friends page" so unseenCount drops to 0. the badge
// reappears only when a request arrives after this moment
export const markRequestsSeen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    await prisma.user.update({
      where: { id: userId },
      data: { friendRequestsSeenAt: new Date() },
    });
    res.status(204).end();
  },
);

export const getOutgoingRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const result = await prisma.friendConnection.findMany({
      where: { requesterId: userId, status: "PENDING" },
      include: { addressee: { select: { id: true, name: true, photo: true } } },
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

    // new friend signal affects recs for both sides
    void invalidateRecs(userId, friendId);

    // tell the requester (friendId) their request was accepted, so their Sent
    // list + friends list update live without a refresh. the accepter is the
    // one acting, so their own UI already refreshes via the mutation
    for (const sockId of getReceiverSocketIds(friendId)) {
      io.to(sockId).emit("friendAccepted");
    }

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

    // friendship gone -> recs change for both sides
    void invalidateRecs(userId, friendId);

    res.status(204).json({});
  },
);

/* TODO N+1: frontend FriendCard fires useUserBooksForUser per friend to
   show "Reading X" + "Y books on shelf". add readingBook + publicBookCount
   here (2 extra queries: distinct userBook by userId ordered by
   progressUpdatedAt for readingBook, groupBy userId + _count for the total).
   then drop the per-card fetch on the frontend */
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

    // sort alphabetically by the OTHER person's name
    // done in JS since the name lives on a relation that flips by direction
    const otherName = (c: (typeof result)[number]) =>
      (c.requesterId === userId ? c.addressee?.name : c.requester?.name) ?? "";
    result.sort((a, b) =>
      otherName(a).localeCompare(otherName(b), undefined, {
        sensitivity: "base",
      }),
    );

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

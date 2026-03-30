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

    // 3. Don't pass status or IDs from body — use only trusted values
    const result = await prisma.friendConnection.create({
      data: { requesterId: userId, addresseeId: friendId },
    });

    res.status(201).json({
      status: "success",
      data: { friendRequest: result },
    });
  },
);

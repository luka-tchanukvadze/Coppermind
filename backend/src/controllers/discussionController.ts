import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";

export const createDiscussion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { title, description } = req.body;

    const discussion = await prisma.discussion.create({
      data: { title, description, creatorId: userId },
    });

    res.status(201).json({
      status: "success",
      data: {
        discussion,
      },
    });
  },
);

export const getDiscussions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const discussions = await prisma.discussion.findMany({
      include: {
        creator: { select: { id: true, name: true, photo: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: discussions.length,
      data: {
        discussions,
      },
    });
  },
);

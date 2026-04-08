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

export const getDiscussion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, photo: true } },
        comments: {
          include: { user: { select: { id: true, name: true, photo: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!discussion) return next(new AppError("Discussion not found", 404));

    res.status(200).json({
      status: "success",
      data: { discussion },
    });
  },
);

export const updateDiscussion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const { title, description } = req.body;

    const discussion = await prisma.discussion.updateMany({
      where: { id, creatorId: userId },
      data: { title, description },
    });

    if (discussion.count === 0)
      return next(new AppError("Discussion not found", 404));

    res.status(204).json({});
  },
);

export const deleteDiscussion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const discussion = await prisma.discussion.deleteMany({
      where: { id, creatorId: userId },
    });

    if (discussion.count === 0)
      return next(new AppError("Discussion not found", 404));

    res.status(204).json({});
  },
);

// ---- Comments & Likes ----

export const addComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: { content, userId, discussionId: id },
    });

    res.status(201).json({
      status: "success",
      data: { comment },
    });
  },
);

import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import { createActivity } from "../utils/createActivity.js";
import { ActivityKind } from "../../generated/prisma/index.js";

export const createDiscussion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    // bookId is optional - old discussions stay book-less
    const { title, description, bookId } = req.body;

    const discussion = await prisma.discussion.create({
      data: { title, description, creatorId: userId, bookId: bookId ?? null },
    });

    void createActivity({
      userId,
      kind: ActivityKind.NEW_DISCUSSION,
      discussionId: discussion.id,
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
        book: {
          select: { id: true, title: true, author: true, coverImage: true },
        },
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
    const userId = req.user!.id;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, photo: true } },
        book: {
          select: { id: true, title: true, author: true, coverImage: true },
        },
        comments: {
          include: { user: { select: { id: true, name: true, photo: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { likes: true } },
        // includes ONLY my own like (if any) - uses the unique index, basically free
        // lets the frontend show the correct filled/empty heart on load
        likes: { where: { userId }, select: { id: true } },
      },
    });

    if (!discussion) return next(new AppError("Discussion not found", 404));

    // strip the raw likes array, expose a simple boolean
    const { likes, ...rest } = discussion;
    res.status(200).json({
      status: "success",
      data: {
        discussion: { ...rest, likedByMe: likes.length > 0 },
      },
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
    const isAdmin = req.user!.role === "admin";
    const id = req.params.id as string;

    // admin bypasses the creator check - moderation. 404 if id wrong either way
    const discussion = await prisma.discussion.deleteMany({
      where: isAdmin ? { id } : { id, creatorId: userId },
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
      include: { user: { select: { id: true, name: true, photo: true } } },
    });

    void createActivity({
      userId,
      kind: ActivityKind.DISCUSSION_COMMENT,
      commentId: comment.id,
    });

    res.status(201).json({
      status: "success",
      data: { comment },
    });
  },
);

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "admin";
    const id = req.params.id as string;
    const commentId = req.params.commentId as string;

    // admin can delete any comment for moderation - same pattern as deleteDiscussion
    const comment = await prisma.comment.deleteMany({
      where: isAdmin
        ? { discussionId: id, id: commentId }
        : { discussionId: id, userId, id: commentId },
    });

    if (comment.count === 0)
      return next(new AppError("Comment not found", 404));

    res.status(204).json({});
  },
);

export const toggleLike = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Check if user already liked this discussion
    const existingLike = await prisma.like.findUnique({
      where: { userId_discussionId: { userId, discussionId: id } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ status: "success", liked: false });
    }

    await prisma.like.create({ data: { userId, discussionId: id } });
    res.status(200).json({ status: "success", liked: true });
  },
);

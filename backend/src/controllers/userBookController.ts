import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

const BOOKS_CACHE_KEY = "all_books";
const getUserBooksCacheKey = (userId: string) => `user_books:${userId}`;

export const addUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const {
      title,
      author,
      genres,
      coverImage,
      externalApiId,
      progress,
      isPrivate,
    } = req.body;

    // Find existing book or create a new one
    const book = await prisma.book.upsert({
      where: { title },
      update: {},
      create: { title, author, genres, coverImage, externalApiId },
    });

    // Link this book to the user
    const userBook = await prisma.userBook.create({
      data: { userId, bookId: book.id, progress, isPrivate },
    });

    // Invalidate both caches in a single pipeline (one round trip)
    await redisClient
      .multi()
      .del(BOOKS_CACHE_KEY)
      .del(getUserBooksCacheKey(userId))
      .exec();

    res.status(201).json({
      status: "success",
      data: {
        userBook,
      },
    });
  },
);

export const getAllUserBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    // Return cached data if available
    const cachedUserBooks = await redisClient.get(getUserBooksCacheKey(userId));

    if (cachedUserBooks) {
      const userBooks = JSON.parse(cachedUserBooks);

      return res.status(200).json({
        status: "success",
        source: "cache",
        results: userBooks.length,
        data: {
          userBooks,
        },
      });
    }

    // Fetch from DB and cache for 24h
    const userBooks = await prisma.userBook.findMany({
      where: { userId },
      include: { book: true },
    });

    await redisClient.set(
      getUserBooksCacheKey(userId),
      JSON.stringify(userBooks),
      {
        EX: 86400,
      },
    );

    res.status(200).json({
      status: "success",
      source: "database",
      results: userBooks.length,
      data: {
        userBooks,
      },
    });
  },
);

export const getUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    // Check the cached list first
    const cachedUserBooks = await redisClient.get(getUserBooksCacheKey(userId));

    if (cachedUserBooks) {
      const userBook = JSON.parse(cachedUserBooks).find(
        (ub: any) => ub.id === id,
      );

      if (!userBook)
        return next(new AppError("No book found with that ID", 404));

      return res.status(200).json({
        status: "success",
        source: "cache",
        data: { userBook },
      });
    }

    // Fall back to DB
    const userBook = await prisma.userBook.findUnique({
      where: { id },
      include: { book: true, customData: true },
    });

    // Verify it exists and belongs to this user
    if (!userBook || userBook.userId !== userId)
      return next(new AppError("No book found with that ID", 404));

    res.status(200).json({
      status: "success",
      source: "database",
      data: { userBook },
    });
  },
);

export const deleteUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    // deleteMany with both id + userId acts as an ownership check in one query
    const result = await prisma.userBook.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0)
      return next(new AppError("No book found with that ID", 404));

    // Only invalidate this user's cache - book catalog is unchanged
    await redisClient.del(getUserBooksCacheKey(userId));

    res.status(204).json({});
  },
);

export const updateUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    // Only these fields are user-editable
    const { progress, isPrivate } = req.body;

    // Ownership check + update in one query
    const result = await prisma.userBook.updateMany({
      where: { id, userId },
      data: { progress, isPrivate },
    });

    if (result.count === 0)
      return next(new AppError("No book found with that ID", 404));

    await redisClient.del(getUserBooksCacheKey(userId));

    // updateMany returns count only - fetch the full record to return it
    const updatedBook = await prisma.userBook.findUnique({
      where: { id },
      include: { book: true },
    });

    res.status(200).json({
      status: "success",
      data: { userBook: updatedBook },
    });
  },
);

// Public endpoint - returns only non-private books for a given user
export const getPublicUserBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;

    const friendBooks = await prisma.userBook.findMany({
      where: { userId, isPrivate: false },
      include: { book: true },
    });

    res.status(200).json({
      status: "success",
      results: friendBooks.length,
      data: { friendBooks },
    });
  },
);

// ─── Custom Data CRUD (nested under a userBook) ───

export const addCustomData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userBookId = req.params.id as string;
    const userId = req.user!.id;

    // Ownership check before allowing custom data creation
    const userBook = await prisma.userBook.findUnique({
      where: { id: userBookId },
    });

    if (!userBook || userBook.userId !== userId)
      return next(new AppError("No book found with that ID", 404));

    const { title, content, isPrivate } = req.body;

    const customData = await prisma.customData.create({
      data: { title, content, isPrivate, userBookId, userId },
    });

    await redisClient.del(getUserBooksCacheKey(userId));

    res.status(201).json({
      status: "success",
      data: {
        customData,
      },
    });
  },
);

export const getCustomData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dataId = req.params.dataId as string;
    const userId = req.user!.id;

    // Fetch by dataId and verify it belongs to this user
    const customData = await prisma.customData.findUnique({
      where: { id: dataId },
    });

    if (!customData || customData.userId !== userId)
      return next(new AppError("No custom data found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: { customData },
    });
  },
);

export const updateCustomData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dataId = req.params.dataId as string;
    const userId = req.user!.id;

    const { title, content, isPrivate } = req.body;

    // Ownership check + update in one query - only updates if both id and userId match
    const result = await prisma.customData.updateMany({
      where: { id: dataId, userId },
      data: { title, content, isPrivate },
    });

    if (result.count === 0)
      return next(new AppError("No custom data found with that ID", 404));

    await redisClient.del(getUserBooksCacheKey(userId));

    // updateMany returns count only - fetch the full record to return
    const updatedData = await prisma.customData.findUnique({
      where: { id: dataId },
    });

    res.status(200).json({
      status: "success",
      data: { customData: updatedData },
    });
  },
);

export const deleteCustomData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dataId = req.params.dataId as string;
    const userId = req.user!.id;

    // 1. Delete with ownership check (where: { id: dataId, userId })

    // 2. If nothing deleted, return 404

    // 3. Invalidate this user's cache

    // 4. Send 204 response
  },
);

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

export const getUserBooks = catchAsync(
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
      include: { book: true },
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
    // Get the userBook ID from the URL and the logged-in user's ID
    const id = req.params.id as string;
    const userId = req.user!.id;

    // Delete the userBook record (the book itself stays in the catalog)
    const result = await prisma.userBook.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0)
      return next(new AppError("No book found with that ID", 404));

    // Invalidate this user's cache only — the global books cache is unaffected
    await redisClient.del(getUserBooksCacheKey(userId));

    // Send 204 (no content) response
    res.status(204).json({
      status: "success",
    });
  },
);

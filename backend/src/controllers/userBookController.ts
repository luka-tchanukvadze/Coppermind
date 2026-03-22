import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

const BOOKS_CACHE_KEY = "all_books";
const getUserBooksCacheKey = (userId: string) => `user_books:${userId}`;

export const addUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return next(new AppError("You are not logged in", 401));

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
    const userId = req.user?.id;
    if (!userId) return next(new AppError("You are not logged in", 401));

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

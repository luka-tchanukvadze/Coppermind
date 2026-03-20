import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

const BOOKS_CACHE_KEY = "all_books";

export const addBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await prisma.book.create({
      data: req.body,
    });

    // Invalidate cache - the list is now stale
    await redisClient.del(BOOKS_CACHE_KEY);

    res.status(201).json({
      status: "success",
      data: {
        book: data,
      },
    });
  },
);

export const getAllBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check Redis cache first
    const cachedBooks = await redisClient.get(BOOKS_CACHE_KEY);
    if (cachedBooks) {
      const books = JSON.parse(cachedBooks);

      return res.status(200).json({
        status: "success",
        source: "cache",
        results: books.length,
        data: {
          books,
        },
      });
    }

    // No cache hit - query the database
    const data = await prisma.book.findMany();

    // Cache the result for 24 hours
    await redisClient.set(BOOKS_CACHE_KEY, JSON.stringify(data), { EX: 86400 });

    res.status(200).json({
      status: "success",
      source: "database",
      results: data.length,
      data: {
        books: data,
      },
    });
  },
);

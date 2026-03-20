import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";

const BOOKS_CACHE_KEY = "all_books";

export const addUserBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO 1: Get the logged-in user's ID from the request object.

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

    const book = await prisma.book.upsert({
      where: { title },
      update: {},
      create: { title, author, genres, coverImage, externalApiId },
    });

    // TODO 3: Create the UserBook linking this user to that book.

    const userBook = await prisma.userBook.create({
      data: { userId, bookId: book.id, progress, isPrivate },
    });

    // TODO 4: Invalidate the books cache since a new book may have been added.
    await redisClient.del(BOOKS_CACHE_KEY);

    // TODO 5: Send ONE response with status 201, containing the userBook data from TODO 3.
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
    // TODO 6: Get the logged-in user's ID (same as TODO 1).
    // TODO 7: Query prisma.userBook.findMany() with:
    //   where: { userId }           — only THIS user's books
    //   include: { book: true }     — include the book details in the response
    // TODO 8: Send response with the userBooks data.
  },
);

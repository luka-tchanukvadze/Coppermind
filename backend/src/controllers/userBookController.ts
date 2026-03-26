import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import redisClient from "../redisClient.js";
import APIFeatures from "../utils/apiFeatures.js";

const BOOKS_CACHE_KEY = "all_books";

// Fields that can be filtered, sorted, and selected on userBooks
const USER_BOOK_ALLOWED_FIELDS = [
  "progress",
  "isPrivate",
  "createdAt",
  "progressUpdatedAt",
];

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

    // Invalidate global books cache since upsert may have added a new book
    await redisClient.del(BOOKS_CACHE_KEY);

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

    const features = new APIFeatures(req.query, USER_BOOK_ALLOWED_FIELDS)
      .filter()
      .sort()
      .fields()
      .paginate();

    const query = features.build();
    query.where = { ...query.where, userId };

    const userBooks = await prisma.userBook.findMany({
      ...query,
      include: query.select ? undefined : { book: true },
    });

    res.status(200).json({
      status: "success",
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

    const userBook = await prisma.userBook.findUnique({
      where: { id },
      include: { book: true, customData: true },
    });

    // Verify it exists and belongs to this user    if (!userBook || userBook.userId !== userId)
    return next(new AppError("No book found with that ID", 404));

    res.status(200).json({
      status: "success",
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

//////////////////////
// Public endpoint - returns only non-private books for a given user
//////////////////////

export const getPublicUserBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;

    const features = new APIFeatures(req.query, USER_BOOK_ALLOWED_FIELDS)
      .filter()
      .sort()
      .fields()
      .paginate();

    const query = features.build();
    // Always enforce: only this user's public books
    query.where = { ...query.where, userId, isPrivate: false };

    const friendBooks = await prisma.userBook.findMany({
      ...query,
      include: query.select ? undefined : { book: true },
    });

    res.status(200).json({
      status: "success",
      results: friendBooks.length,
      data: { friendBooks },
    });
  },
);

//////////////////////
// ─── Custom Data CRUD (nested under a userBook) ───
//////////////////////

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

    // Ownership check + delete in one query
    const result = await prisma.customData.deleteMany({
      where: { id: dataId, userId },
    });

    if (result.count === 0)
      return next(new AppError("No custom data found with that ID", 404));

    res.status(204).json({});
  },
);

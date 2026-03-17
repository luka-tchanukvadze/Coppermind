import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";

export const addBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await prisma.book.create({
      data: req.body,
    });

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
    const data = await prisma.book.findMany();

    res.status(200).json({
      status: "success",
      results: data.length,
      data: {
        books: data,
      },
    });
  },
);

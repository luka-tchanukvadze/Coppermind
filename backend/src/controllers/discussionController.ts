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

import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";

export const sendRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const friendId = req.params.friendId;
    const userId = req.user!.id;
  },
);

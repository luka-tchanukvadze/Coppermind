import { Request, Response, NextFunction } from "express";
import catchAsync from "./../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "./../utils/appError.js";

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id.toString();
  next();
};

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return next(new AppError("No user found with the ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  },
);

export const updateMe = (req: Request, res: Response): void => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

export const deleteMe = (req: Request, res: Response): void => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        role: true,
        active: true,
      },
    });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  },
);

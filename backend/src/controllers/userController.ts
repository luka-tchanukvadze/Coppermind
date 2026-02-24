import { Request, Response, NextFunction } from "express";
import catchAsync from "./../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "./../utils/appError.js";

//////////////////////////////////
////////  helpers //////////
//////////////////////////////////

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id.toString();
  next();
};
//////////////////////////////////
//////// HTTP controllers ////////
//////////////////////////////////

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

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Block password updates here
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Use /updateMyPassword.",
          400,
        ),
      );
    }

    // 2) Filter allowed fields
    const filteredBody = filterObj(req.body, "name", "email", "photo");

    // 3) Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: filteredBody,
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        role: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  },
);

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

import { Request, Response, NextFunction } from "express";
import catchAsync from "./../utils/catchAsync.js";
import prisma from "../prisma.js";

type PrismaModel = keyof typeof prisma;

export const getAll = (model: PrismaModel) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const delegate = prisma[model] as any;

    const data = await delegate.findMany();

    res.status(200).json({
      status: "success",
      results: data.length,
      data: {
        [model]: data,
      },
    });
  });

export const createOne = (model: PrismaModel) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const delegate = prisma[model] as any;

    const data = await delegate.create({
      data: req.body,
    });

    res.status(200).json({
      status: "success",
      results: data.length,
      data: {
        [model]: data,
      },
    });
  });

import { Request, Response, NextFunction } from "express";
import AppError from "./../utils/appError.js";
// import { AppError as AppErrorInterface } from './../types';

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status,
    message: err.message,
    stack: err.stack,

    // useful for Prisma
    code: err.code,
    meta: err.meta,
  });
};

import { Request, Response, NextFunction } from "express";
import AppError from "./../utils/appError.js";

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message;

  // Map known Prisma errors to readable HTTP responses
  if (err.code === "P2002") {
    statusCode = 409;
    status = "fail";
    const target = (err.meta?.target as string[])?.join(", ") || "unique field";
    message = `Duplicate value for ${target}`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    status = "fail";
    message = "Record not found";
  } else if (err.code === "P2003") {
    statusCode = 400;
    status = "fail";
    message = "Invalid reference to related record";
  }

  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    status,
    message,
    // Hide stack and Prisma internals in production
    ...(isDev && { stack: err.stack, code: err.code, meta: err.meta }),
  });
};

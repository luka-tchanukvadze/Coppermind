import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import AppError from "./appError.js";

// validate(schema) returns an express middleware that runs schema.safeParse
// on req.body. on success it replaces req.body with the parsed value (strips
// unknown fields, applies defaults). on failure it forwards a 400 with the
// first field error so the global handler can format it
export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      const path = first.path.join(".") || "body";
      return next(new AppError(`${path}: ${first.message}`, 400));
    }
    req.body = result.data;
    next();
  };

import { Request, Response, NextFunction } from "express";

export const signup = (req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

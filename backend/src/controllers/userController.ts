import { Request, Response, NextFunction } from "express";

export const getMe = (req: Request, res: Response): void => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

export const getUser = (req: Request, res: Response): void => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

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

export const getAllUsers = (req: Request, res: Response): void => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

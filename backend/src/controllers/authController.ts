import { promisify } from "util";
import jwt, { SignOptions } from "jsonwebtoken";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

import prisma from "../prisma.js";
import { Role } from "../../generated/prisma/index.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
// import sendEmail from './../utils/email.js';
// import { User, DecodedToken } from "./.";

interface User {
  id: number;
  name: string;
  email: string;
  photo?: string;
  password?: string;
  role: Role;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
}

////////////////////////////////////////
////////// PASSWORD HELPERS ////////////
////////////////////////////////////////

const hashPasswordIfModified = async (user: User): Promise<User> => {
  if (!user.password) return user;

  user.password = await bcrypt.hash(user.password, 12);
  return user;
};

const correctPassword = async (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const signToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn: any = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) {
    throw new Error("JWT_SECRET or JWT_EXPIRES_IN is not defined!");
  }

  const payload = { id };
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};

const changedPasswordAfter = (JWTTimestamp: number, user: User): boolean => {
  if (user.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      new Date(user.passwordChangedAt).getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const createPasswordResetToken = (): {
  resetToken: string;
  hashedToken: string;
  expires: Date;
} => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { resetToken, hashedToken, expires };
};

const createSendToken = (
  user: User,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES as string, 10) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  user.password = undefined as any;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

////////////////////////////////////////
////////// AUTH CONTROLLERS ////////////
////////////////////////////////////////
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Extract fields and check password confirmation
    const { name, email, password, password_confirm, role, photo } = req.body;

    if (!password || !password_confirm || password !== password_confirm) {
      return next(new AppError("Passwords do not match", 400));
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3) Create user in Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ? (role.toLowerCase() as Role) : Role.user,
        photo,
      },
    });

    // 4) Send JWT
    createSendToken(newUser as any, 201, req, res);
  },
);

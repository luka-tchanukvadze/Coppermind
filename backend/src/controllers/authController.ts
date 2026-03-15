import { promisify } from "util";
import jwt, { SignOptions } from "jsonwebtoken";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

import prisma from "../prisma.js";
import { Role } from "../../generated/prisma/index.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import { User, DecodedToken } from "../../../types.d.js";
import sendEmail from "./../utils/email.js";

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

const signToken = (id: string): string => {
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
    createSendToken(newUser as User, 201, req, res);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) Check if email & password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // 2) Find user + explicitly include password
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3) Check if user exists & password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 4) Remove sensitive fields from response
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
    };

    // 5) Send token
    createSendToken(safeUser as User, 200, req, res);
  },
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1) Get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in.", 401));
    }

    // 2) Verify token
    const decoded = (await (promisify(jwt.verify) as any)(
      token,
      process.env.JWT_SECRET as string,
    )) as DecodedToken;

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser || currentUser.active === false) {
      return next(new AppError("The user no longer exists.", 401));
    }

    // 4) Check if password changed after token
    if (changedPasswordAfter(decoded.iat, currentUser as User)) {
      return next(
        new AppError("Password recently changed. Log in again.", 401),
      );
    }

    // 5) Grant access
    req.user = currentUser as User;
    next();
  },
);

export const restrictTo =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission for this action", 403),
      );
    }

    next();
  };

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!newPassword || newPassword !== newPasswordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }

    // 1) Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, password: true },
    });

    if (!user || !(await correctPassword(currentPassword, user.password))) {
      return next(new AppError("Current password is wrong", 401));
    }

    // 2) Hash new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // 3) Update
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordChangedAt: new Date(),
      },
    });

    // 4) Send new token
    createSendToken(updatedUser as User, 200, req, res);
  },
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on posted email
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return next(new AppError("There is no user with that email address.", 404));
    }

    // 2) Generate the random reset token
    const { resetToken, hashedToken, expires } = createPasswordResetToken();

    // 3) Save hashed token + expiry to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    // 4) Send plain token to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      console.error("Email error:", err);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      return next(new AppError("There was an error sending the email. Try again later!", 500));
    }
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Hash the token from the URL and find the matching user
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token as string)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    // 2) Token invalid or expired
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    const { password, passwordConfirm } = req.body;

    if (!password || password !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }

    // 3) Set new password and clear reset fields
    const hashed = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordChangedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // 4) Log user in
    createSendToken(updatedUser as User, 200, req, res);
  },
);

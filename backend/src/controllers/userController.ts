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
  req.params.id = req.user!.id;
  next();
};
//////////////////////////////////
//////// HTTP controllers ////////
//////////////////////////////////

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    // email is personal data - only return it to the user themselves or to admins
    // (admins need it for moderation). everyone else gets the public-safe shape
    const canSeeEmail =
      id === req.user!.id || req.user!.role === "admin";

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: canSeeEmail,
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

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { active: false },
    });

    // sign them out too - otherwise the cookie stays and frontend middleware bounces to /feed.
    // flags mirror createSendToken so the clear actually overrides the original
    res.cookie("jwt", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: "lax",
    });
    res.status(204).end();
  },
);

// admin moderation: soft-delete another user. matches deleteMe so the
// data + activity history sticks around for audit
export const deleteUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    // updateMany so a wrong/missing id surfaces as 404, not a thrown error
    const result = await prisma.user.updateMany({
      where: { id },
      data: { active: false },
    });

    if (result.count === 0)
      return next(new AppError("No user found with the ID", 404));

    res.status(204).end();
  },
);

/* TODO N+1: frontend FindUserCard fires useMutualFriends per candidate to
   show "X mutual friends". add a viewer-scoped mutualCount here (2 queries:
   my friend connections + all friend connections of users in the list, then
   intersect in JS) so the page renders without the per-card fan-out */
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      // admins are moderation accounts - keep them out of friend search
      where: { active: true, role: { not: "admin" } },
      // no email here - this is the public discovery list, anyone with an account
      // can call it. don't hand out everyone's address
      select: {
        id: true,
        name: true,
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

// stats for the profile page header (friends/discussions/public-notes counts)
// 3 counts in parallel - each is a single indexed scan, no joins
export const getUserProfileStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    // existence check first
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) return next(new AppError("No user found with the ID", 404));

    const [friends, discussions, publicNotes] = await Promise.all([
      prisma.friendConnection.count({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: id }, { addresseeId: id }],
        },
      }),
      prisma.discussion.count({ where: { creatorId: id } }),
      prisma.customData.count({ where: { userId: id, isPrivate: false } }),
    ]);

    res.status(200).json({
      status: "success",
      data: { stats: { friends, discussions, publicNotes } },
    });
  },
);

// discussions tab on a profile - everything this user started, newest first
export const getUserDiscussions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const discussions = await prisma.discussion.findMany({
      where: { creatorId: id },
      include: {
        creator: { select: { id: true, name: true, photo: true } },
        book: {
          select: { id: true, title: true, author: true, coverImage: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: discussions.length,
      data: { discussions },
    });
  },
);

// public notes tab on a profile - only non-private custom data this user wrote.
// each note carries its book inline so the frontend can group by book
export const getUserPublicNotes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const notes = await prisma.customData.findMany({
      where: { userId: id, isPrivate: false },
      include: {
        userBook: {
          select: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                coverImage: true,
                genres: true,
                externalApiId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // flatten note.userBook.book -> note.book so the frontend type is flat
    const flat = notes.map(({ userBook, ...rest }) => ({
      ...rest,
      book: userBook.book,
    }));

    res.status(200).json({
      status: "success",
      results: flat.length,
      data: { notes: flat },
    });
  },
);

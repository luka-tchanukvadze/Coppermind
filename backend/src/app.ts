import express, { Request, Response, NextFunction } from "express";
import userRouter from "./routes/userRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import userBookRouter from "./routes/userBookRoutes.js";
import friendRouter from "./routes/friendRoutes.js";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// 1) Global Middlewares

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/user-books", userBookRouter);
app.use("/api/v1/friends", friendRouter);

// TODO: Add remaining routes:
// - /api/v1/friends       (FriendConnection: send/accept/reject/remove, list friends)
// - /api/v1/discussions    (Discussion + Comment + Like: community forum)
// - /api/v1/conversations  (Conversation + Message: real-time messaging)

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;

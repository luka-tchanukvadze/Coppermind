import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import userRouter from "./routes/userRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import userBookRouter from "./routes/userBookRoutes.js";
import friendRouter from "./routes/friendRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import discussionRouter from "./routes/discussionRoutes.js";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// 1) Global Middlewares

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/user-books", userBookRouter);
app.use("/api/v1/friends", friendRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/discussions", discussionRouter);

/*
TODO:
✅ /api/v1/friends - FriendConnection: send/accept/reject/remove, list friends
✅ /api/v1/discussions - Discussion + Comment + Like: community forum
✅ /api/v1/messages - Conversation + Message (socket.io set up, emit left to add)

Later:
- Zod input validation on req.body
- Security: Helmet, express-rate-limit, restrict CORS origins
- Tests (Jest + Supertest)
- Dockerize + deploy
*/

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;

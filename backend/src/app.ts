import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import redisClient from "./redisClient.js";

import userRouter from "./routes/userRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import userBookRouter from "./routes/userBookRoutes.js";
import friendRouter from "./routes/friendRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import discussionRouter from "./routes/discussionRoutes.js";
import feedRouter from "./routes/feedRoutes.js";
import recommendationsRouter from "./routes/recommendationsRoutes.js";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// testing pipeline

// trust the first hop. host (render/fly/nginx) terminates TLS so req.secure
// + req.ip come from x-forwarded-* headers. without this the JWT cookie
// ships without secure in prod and rate-limit sees one shared proxy IP
app.set("trust proxy", 1);

// 1) Global Middlewares

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// security headers (X-Frame-Options, no-sniff, etc.)
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// 10kb body limit blocks giant payloads before they hit any handler
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

// liveness probe for docker/cloudflare
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// rate limit on auth endpoints - 10 attempts per 15 min per IP.
// blunts brute-force on login + signup spam. forgotPassword too so
// attackers can't flood inboxes. counter lives in redis so it survives
// container restarts and works across multiple backend instances
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many attempts, try again later" },
  // if redis is down the store throws on every call. without this, auth
  // endpoints would 500 for everyone instead of just losing rate limiting.
  // degrade open: allow the request through rather than block login/signup
  passOnStoreError: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: "rl:auth:",
  }),
});
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/signup", authLimiter);
app.use("/api/v1/users/forgotPassword", authLimiter);
app.use("/api/v1/users/resetPassword", authLimiter);

// book search hits external APIs (google books quota + the pi). cap it so a
// few users typing fast can't burn the daily quota or hammer the box. looser
// than auth - 30/min/IP is plenty for real typing-with-debounce use
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Slow down a moment, then try again" },
  passOnStoreError: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: "rl:search:",
  }),
});
app.use("/api/v1/books/search", searchLimiter);

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/user-books", userBookRouter);
app.use("/api/v1/friends", friendRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/discussions", discussionRouter);
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1/recommendations", recommendationsRouter);

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

// 404 - runs when no route above matched the request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;

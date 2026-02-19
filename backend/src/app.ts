import express, { Request, Response, NextFunction } from "express";
import prisma from "./db.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/users", userRouter);

// app.all('*', (req:Request, res: Response, next: NextFunction) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// })

export default app;

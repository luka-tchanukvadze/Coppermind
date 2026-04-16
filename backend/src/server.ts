import dotenv from "dotenv";
import http from "http";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  if (err instanceof Error) {
    console.log("ERROR!!!", err.name, err.message);
  } else {
    console.log("ERRROR!!!", err);
  }
  process.exit(1);
});

dotenv.config();

import app from "./app.js";
import prisma from "./prisma.js";
import redisClient from "./redisClient.js";
import { initSocket } from "./socket/socket.js";

const PORT = Number(process.env.PORT) || 5001;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }

  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }

  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  if (err instanceof Error) {
    console.log("ERROR!!!", err.name, err.message);
  } else {
    console.log("ERROR!!!", err);
  }
  server.close(() => process.exit(1));
});

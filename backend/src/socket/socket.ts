import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import prisma from "../prisma.js";
import { DecodedToken } from "../../../types.d.js";

// Map userId -> socketId so I can send messages to specific users
const userSocketMap = new Map<string, string>();

let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // identity comes from the signed jwt cookie, not a query param
  // Without this anyone could connect as any userId and read their messages
  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      const token = cookie
        ?.split("; ")
        .find((c) => c.startsWith("jwt="))
        ?.slice(4);

      if (!token) return next(new Error("Not authenticated"));

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, active: true },
      });

      if (!user || user.active === false) {
        return next(new Error("Not authenticated"));
      }

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    userSocketMap.set(userId, socket.id);
    console.log(`User connected: ${userId} -> ${socket.id}`);

    socket.on("disconnect", () => {
      // only clear if this socket is still the mapped one. a stale reconnect
      // (or React StrictMode double-mount) can fire disconnect AFTER the new
      // socket registered - deleting by userId alone would wipe the live entry
      if (userSocketMap.get(userId) === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
    });
  });

  return io;
};

export const getReceiverSocketId = (userId: string): string | undefined => {
  return userSocketMap.get(userId);
};

export { io };

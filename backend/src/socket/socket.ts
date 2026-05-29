import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import prisma from "../prisma.js";
import { DecodedToken } from "../../../types.d.js";

// userId -> Set<socketId>. one user can have many active sockets (open tabs,
// reconnects). storing a single id meant opening a 2nd tab silently kicked
// the 1st off realtime, and fast disconnect/reconnect could orphan the live
// socket. set lets every tab stay subscribed
const userSocketMap = new Map<string, Set<string>>();

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

    const sockets = userSocketMap.get(userId) ?? new Set<string>();
    sockets.add(socket.id);
    userSocketMap.set(userId, sockets);
    console.log(
      `User connected: ${userId} -> ${socket.id} (now ${sockets.size} live)`,
    );

    socket.on("disconnect", () => {
      const set = userSocketMap.get(userId);
      if (!set) return;
      set.delete(socket.id);
      if (set.size === 0) {
        userSocketMap.delete(userId);
        console.log(`User disconnected: ${userId} (last tab)`);
      } else {
        console.log(`Tab disconnected for ${userId} (${set.size} still live)`);
      }
    });
  });

  return io;
};

// returns all live socket IDs for a user (could be many - tabs, devices).
// callers should iterate and emit to each
export const getReceiverSocketIds = (userId: string): string[] => {
  const set = userSocketMap.get(userId);
  return set ? Array.from(set) : [];
};

export { io };

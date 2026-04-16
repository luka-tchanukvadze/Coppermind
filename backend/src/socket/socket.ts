import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";

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

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} -> ${socket.id}`);
    }

    socket.on("disconnect", () => {
      if (userId) {
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

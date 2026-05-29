import { Server as SocketServer, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import prisma from "../prisma.js";
import { DecodedToken } from "../../../types.d.js";

// userId -> Set<socketId>. one user can have many active sockets (open tabs,
// reconnects). storing a single id meant opening a 2nd tab silently kicked
// the 1st off realtime, and fast disconnect/reconnect could orphan the live
// socket. set lets every tab stay subscribed
const userSocketMap = new Map<string, Set<string>>();

// per-socket activity state. "active" = tab visible + user not idle.
// "away" = tab hidden or user idle (>5min). client emits presence:away /
// :back to flip it. user-level state is derived: any active socket -> online,
// all away -> away, none -> offline
type SocketActivity = "active" | "away";
const socketActivity = new Map<string, SocketActivity>();

type UserState = "online" | "away" | "offline";

function userState(userId: string): UserState {
  const sockets = userSocketMap.get(userId);
  if (!sockets || sockets.size === 0) return "offline";
  for (const sid of sockets) {
    if (socketActivity.get(sid) === "active") return "online";
  }
  return "away";
}

let io: SocketServer;

async function fetchFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendConnection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) =>
    r.requesterId === userId ? r.addresseeId : r.requesterId,
  );
}

// fan a presence event out to every socket of the given friends.
// extra is event-specific payload (e.g. lastSeenAt on :offline)
function broadcastPresence(
  friendIds: string[],
  event: "presence:online" | "presence:away" | "presence:offline",
  userId: string,
  extra?: Record<string, unknown>,
) {
  const payload = { userId, ...extra };
  for (const friendId of friendIds) {
    const sockets = userSocketMap.get(friendId);
    if (!sockets) continue;
    for (const sid of sockets) {
      io.to(sid).emit(event, payload);
    }
  }
}

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

  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId as string;

    // capture state BEFORE the add - "wasOnline" means I already had a tab
    // open. used to decide whether to fire presence:online to friends
    const wasOnline = userState(userId) === "online";

    const sockets = userSocketMap.get(userId) ?? new Set<string>();
    sockets.add(socket.id);
    userSocketMap.set(userId, sockets);
    socketActivity.set(socket.id, "active");

    console.log(
      `User connected: ${userId} -> ${socket.id} (now ${sockets.size} live)`,
    );

    // query friends ONCE on connect and stash. accepting a new friend mid-
    // session won't update this until reconnect - intentional, friend accept
    // is rare and the cost of re-querying on every presence change is real
    const friendIds = await fetchFriendIds(userId);
    socket.data.friendIds = friendIds;

    // snapshot: tell THIS socket who of my friends is currently online or away
    const initial: { online: string[]; away: string[] } = {
      online: [],
      away: [],
    };
    for (const fid of friendIds) {
      const s = userState(fid);
      if (s === "online") initial.online.push(fid);
      else if (s === "away") initial.away.push(fid);
    }
    socket.emit("presence:initial", initial);

    // only fire :online if I just transitioned from no-active-tab -> active.
    // if I already had a tab (wasOnline), friends already know
    if (!wasOnline) {
      broadcastPresence(friendIds, "presence:online", userId);
    }

    // client tells us it went idle / tab hidden
    socket.on("presence:away", () => {
      if (socketActivity.get(socket.id) === "away") return;
      const before = userState(userId);
      socketActivity.set(socket.id, "away");
      const after = userState(userId);
      if (before !== after) {
        const event =
          after === "away" ? "presence:away" : "presence:offline";
        broadcastPresence(friendIds, event, userId);
      }
    });

    socket.on("presence:back", () => {
      if (socketActivity.get(socket.id) === "active") return;
      const before = userState(userId);
      socketActivity.set(socket.id, "active");
      const after = userState(userId);
      if (before !== after) {
        broadcastPresence(friendIds, "presence:online", userId);
      }
    });

    // typing forwarding. client knows which friend they're typing to
    socket.on(
      "typing:start",
      ({ friendId }: { friendId: string }) => {
        if (!friendIds.includes(friendId)) return;
        const targetSockets = userSocketMap.get(friendId);
        if (!targetSockets) return;
        for (const sid of targetSockets) {
          io.to(sid).emit("typing:start", { fromUserId: userId });
        }
      },
    );

    socket.on(
      "typing:stop",
      ({ friendId }: { friendId: string }) => {
        if (!friendIds.includes(friendId)) return;
        const targetSockets = userSocketMap.get(friendId);
        if (!targetSockets) return;
        for (const sid of targetSockets) {
          io.to(sid).emit("typing:stop", { fromUserId: userId });
        }
      },
    );

    socket.on("disconnect", async () => {
      const set = userSocketMap.get(userId);
      socketActivity.delete(socket.id);
      if (!set) return;
      set.delete(socket.id);

      if (set.size === 0) {
        // last tab closed. clean up, write lastSeenAt, tell friends
        userSocketMap.delete(userId);
        console.log(`User disconnected: ${userId} (last tab)`);

        const now = new Date();
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { lastSeenAt: now },
          });
        } catch (err) {
          console.error(
            "Failed to write lastSeenAt:",
            err instanceof Error ? err.message : err,
          );
        }

        // include lastSeenAt so friends viewing my chat get a fresh value
        // without refetching the conversation
        broadcastPresence(friendIds, "presence:offline", userId, {
          lastSeenAt: now.toISOString(),
        });
      } else {
        // still have other tabs. user state may have shifted online -> away
        // if the closed tab was the only active one
        const after = userState(userId);
        if (after === "away") {
          broadcastPresence(friendIds, "presence:away", userId);
        }
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

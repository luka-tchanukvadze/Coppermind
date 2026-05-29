"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSocket } from "@/lib/socket/socket-provider";

/*
  presence state for the friends of the logged-in user. populated by socket
  events emitted from the backend:
    presence:initial { online: string[], away: string[] }  // one-shot snapshot
    presence:online  { userId }                            // friend came back
    presence:away    { userId }                            // friend went idle
    presence:offline { userId }                            // friend's last tab closed

  idle detection: after IDLE_MS of no mouse/keyboard/touch activity OR
  document.hidden -> emit presence:away to server. on any activity AND
  tab visible -> emit presence:back. server forwards to my friends
*/

type Status = "online" | "away";

type PresenceValue = {
  status: Map<string, Status>;
  // lastSeenAt updates pushed by presence:offline events. preferred over the
  // (potentially stale) value in the conversation API response
  lastSeen: Map<string, string>;
};

const PresenceContext = createContext<PresenceValue>({
  status: new Map(),
  lastSeen: new Map(),
});

const IDLE_MS = 5 * 60 * 1000;

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const [status, setStatus] = useState<Map<string, Status>>(new Map());
  const [lastSeen, setLastSeen] = useState<Map<string, string>>(new Map());

  // socket event subscriptions
  useEffect(() => {
    if (!socket) return;

    const onInitial = ({
      online,
      away,
    }: {
      online: string[];
      away: string[];
    }) => {
      const map = new Map<string, Status>();
      for (const id of online) map.set(id, "online");
      for (const id of away) map.set(id, "away");
      setStatus(map);
    };

    const onOnline = ({ userId }: { userId: string }) => {
      setStatus((prev) => new Map(prev).set(userId, "online"));
    };
    const onAway = ({ userId }: { userId: string }) => {
      setStatus((prev) => new Map(prev).set(userId, "away"));
    };
    const onOffline = ({
      userId,
      lastSeenAt,
    }: {
      userId: string;
      lastSeenAt?: string;
    }) => {
      setStatus((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      if (lastSeenAt) {
        setLastSeen((prev) => new Map(prev).set(userId, lastSeenAt));
      }
    };

    socket.on("presence:initial", onInitial);
    socket.on("presence:online", onOnline);
    socket.on("presence:away", onAway);
    socket.on("presence:offline", onOffline);

    return () => {
      socket.off("presence:initial", onInitial);
      socket.off("presence:online", onOnline);
      socket.off("presence:away", onAway);
      socket.off("presence:offline", onOffline);
      // reset on socket teardown (logout). stale presence is worse than empty
      setStatus(new Map());
      setLastSeen(new Map());
    };
  }, [socket]);

  // idle / visibility detection. emits to server when this tab transitions
  useEffect(() => {
    if (!socket) return;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let away = false;

    const goAway = () => {
      if (away) return;
      away = true;
      socket.emit("presence:away");
    };
    const goBack = () => {
      if (!away) return;
      away = false;
      socket.emit("presence:back");
    };
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (document.hidden) return;
      goBack();
      idleTimer = setTimeout(goAway, IDLE_MS);
    };
    const onVisibility = () => {
      if (document.hidden) goAway();
      else resetIdle();
    };

    resetIdle();
    document.addEventListener("mousemove", resetIdle);
    document.addEventListener("keydown", resetIdle);
    document.addEventListener("touchstart", resetIdle);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      document.removeEventListener("mousemove", resetIdle);
      document.removeEventListener("keydown", resetIdle);
      document.removeEventListener("touchstart", resetIdle);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [socket]);

  const value = useMemo(() => ({ status, lastSeen }), [status, lastSeen]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresenceStatus(userId: string): Status | "offline" {
  const { status } = useContext(PresenceContext);
  return status.get(userId) ?? "offline";
}

export function useIsOnline(userId: string): boolean {
  return usePresenceStatus(userId) === "online";
}

// fresh lastSeenAt for a user, written by the presence:offline event. callers
// fall back to whatever's on their api payload when this returns undefined
export function useLastSeen(userId: string): string | undefined {
  const { lastSeen } = useContext(PresenceContext);
  return lastSeen.get(userId);
}

/*
  typing indicator hook. used in the open conversation: tells the server we're
  typing to friendId (throttled), and reports whether friendId is typing back.
  server forwards typing:start / typing:stop. local fail-safe timer clears the
  flag if start renews don't keep arriving (handles disconnect mid-type)
*/
export function useTypingFor(friendId: string | undefined) {
  const socket = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const lastEmitRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const failSafeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // listen for the friend's typing events
  useEffect(() => {
    if (!socket || !friendId) return;
    const onStart = ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId !== friendId) return;
      setIsTyping(true);
      if (failSafeRef.current) clearTimeout(failSafeRef.current);
      // if no renewal in 5s, the sender probably stopped or dropped
      failSafeRef.current = setTimeout(() => setIsTyping(false), 5000);
    };
    const onStop = ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId !== friendId) return;
      setIsTyping(false);
      if (failSafeRef.current) clearTimeout(failSafeRef.current);
    };
    socket.on("typing:start", onStart);
    socket.on("typing:stop", onStop);
    return () => {
      socket.off("typing:start", onStart);
      socket.off("typing:stop", onStop);
      if (failSafeRef.current) clearTimeout(failSafeRef.current);
      setIsTyping(false);
    };
  }, [socket, friendId]);

  // call from the input onChange. throttles typing:start to once every 2s,
  // schedules a typing:stop 1.5s after the last keystroke
  const notifyTyping = useCallback(() => {
    if (!socket || !friendId) return;
    const now = Date.now();
    if (now - lastEmitRef.current > 2000) {
      socket.emit("typing:start", { friendId });
      lastEmitRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { friendId });
      lastEmitRef.current = 0;
    }, 1500);
  }, [socket, friendId]);

  // explicit stop (e.g. on send) - clears the local timer + tells server now
  const stopTyping = useCallback(() => {
    if (!socket || !friendId) return;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (lastEmitRef.current !== 0) {
      socket.emit("typing:stop", { friendId });
      lastEmitRef.current = 0;
    }
  }, [socket, friendId]);

  return useMemo(
    () => ({ isTyping, notifyTyping, stopTyping }),
    [isTyping, notifyTyping, stopTyping],
  );
}

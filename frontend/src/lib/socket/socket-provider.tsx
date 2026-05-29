"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useMe } from "@/lib/api/users";

// when unset, the client connects to the page's origin and Next's rewrite
// for /socket.io/* forwards to BACKEND_URL. lets the dev cookie (scoped to
// localhost) ride the WS handshake without a cross-origin trip.
// for prod set NEXT_PUBLIC_SOCKET_URL to the backend host directly
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // wait until I know who the user is - no point connecting as a stranger
    if (!me?.id) return;

    // identity comes from the jwt cookie on the handshake (server verifies it)
    // withCredentials makes the browser send the cookie cross-origin.
    // no URL = same-origin (rides the Next.js /socket.io rewrite)
    const s = SOCKET_URL
      ? io(SOCKET_URL, { withCredentials: true })
      : io({ withCredentials: true });
    setSocket(s);

    // dev-only connection logs - drop or gate before prod
    if (process.env.NODE_ENV === "development") {
      s.on("connect", () => console.log("[socket] connected", s.id));
      s.on("disconnect", (reason) =>
        console.log("[socket] disconnected", reason),
      );
      s.on("connect_error", (err) =>
        console.error("[socket] connect_error", err.message),
      );
    }

    // disconnect on logout (me.id changes) or unmount
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [me?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// null until the socket connects - consumers must guard
export function useSocket() {
  return useContext(SocketContext);
}

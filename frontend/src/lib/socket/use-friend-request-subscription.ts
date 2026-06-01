"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket-provider";

// listens for the backend's friendRequest event and refetches incoming
// requests so the nav badge updates the instant someone adds you - no polling.
// mounted app-wide (in MainShell) so it works on any page. the event carries
// no payload; the refetch brings the new request + fresh unseenCount
export function useFriendRequestSubscription() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = () => {
      queryClient.invalidateQueries({ queryKey: ["friends-incoming"] });
    };

    socket.on("friendRequest", handleFriendRequest);
    return () => {
      socket.off("friendRequest", handleFriendRequest);
    };
  }, [socket, queryClient]);
}

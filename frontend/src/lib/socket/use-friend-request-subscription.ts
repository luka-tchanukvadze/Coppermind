"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket-provider";

// live friend-graph updates over the existing socket - no polling. mounted
// app-wide (in MainShell) so it works on any page. both events are payload-free;
// the refetch pulls the fresh state.
//   friendRequest  -> someone added me: refresh incoming (drives the nav badge)
//   friendAccepted -> the person I added accepted: refresh my friends + sent list
export function useFriendRequestSubscription() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = () => {
      queryClient.invalidateQueries({ queryKey: ["friends-incoming"] });
    };

    // I'm the requester and my request just got accepted. mirror the
    // post-friendship invalidations so my friends list, sent list, profile
    // counters, feed and recs all reflect the new friend without a refresh
    const handleFriendAccepted = () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["friends-mutual"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-stats"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    };

    socket.on("friendRequest", handleFriendRequest);
    socket.on("friendAccepted", handleFriendAccepted);
    return () => {
      socket.off("friendRequest", handleFriendRequest);
      socket.off("friendAccepted", handleFriendAccepted);
    };
  }, [socket, queryClient]);
}

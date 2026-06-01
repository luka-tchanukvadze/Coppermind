"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket-provider";
import { useMe } from "@/lib/api/users";
import type {
  ConversationDetail,
  ConversationPreview,
  Message,
} from "@/lib/api/conversations";

// catch newMessage pushes and patch the cache so the open thread updates live.
// backend emits the bare message (no .user). receiver only ever gets messages
// from the other person, so synthesize .user from the cached participant.
// Mounted app-wide (in MainShell) so unread badges update on any page.
export function useNewMessageSubscription() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { data: me } = useMe();

  // read latest pathname/me from refs inside the socket handler so the
  // listener isn't rebound on every navigation (effect deps stay stable)
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const meIdRef = useRef(me?.id);
  meIdRef.current = me?.id;

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // patch the open thread. three cases:
      //  - matches clientMessageId of an optimistic row -> swap (real id/createdAt)
      //  - matches an existing real id -> already there, skip
      //  - otherwise -> append (incoming from the other side)
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", message.conversationId],
        (old) => {
          if (!old) return old;
          const cid = message.clientMessageId;

          if (cid) {
            const optimisticIdx = old.messages.findIndex((m) => m.id === cid);
            if (optimisticIdx !== -1) {
              const next = [...old.messages];
              // keep the optimistic .user (own avatar/name) - server emit doesn't include it
              const prevUser = next[optimisticIdx].user;
              next[optimisticIdx] = { ...message, user: prevUser };
              return { ...old, messages: next };
            }
          }

          if (old.messages.some((m) => m.id === message.id)) return old;

          const sender = old.participants[0]?.user;
          return {
            ...old,
            messages: [...old.messages, { ...message, user: sender }],
          };
        },
      );

      // patch the list: update preview + bump to top + raise unread. only
      // refetch if this is a brand-new conversation not in the cache yet
      // (the refetch brings its unreadCount from the backend).
      queryClient.setQueryData<ConversationPreview[]>(
        ["conversations"],
        (old) => {
          if (!old) return old;
          const idx = old.findIndex((c) => c.id === message.conversationId);
          if (idx === -1) {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            return old;
          }
          // don't count my own echoed messages, or messages in the thread I'm
          // currently looking at (the room marks itself read anyway)
          const isMine = message.userId === meIdRef.current;
          const isViewing =
            pathnameRef.current === `/chat/${message.conversationId}`;
          const prevUnread = old[idx].unreadCount ?? 0;
          const bumped = {
            ...old[idx],
            messages: [message],
            unreadCount: !isMine && !isViewing ? prevUnread + 1 : prevUnread,
          };
          return [bumped, ...old.slice(0, idx), ...old.slice(idx + 1)];
        },
      );
    };

    // resync after a dropped-then-restored connection. messages sent during a
    // mobile network blip are pushed while we're offline and never arrive via
    // newMessage, so the open thread + list would silently miss them. skip the
    // FIRST connect (initial load already has fresh data) and only refetch on
    // an actual reconnect
    // if the socket is already connected when we attach, treat any later
    // connect as a reconnect (we missed the initial one to the race)
    let hasConnected = socket.connected;
    const handleConnect = () => {
      if (!hasConnected) {
        hasConnected = true;
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      const path = pathnameRef.current;
      if (path?.startsWith("/chat/")) {
        const id = path.slice("/chat/".length);
        if (id) {
          queryClient.invalidateQueries({ queryKey: ["conversation", id] });
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("connect", handleConnect);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("connect", handleConnect);
    };
  }, [socket, queryClient]);
}

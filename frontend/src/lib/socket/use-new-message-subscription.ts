"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket-provider";
import type {
  ConversationDetail,
  ConversationPreview,
  Message,
} from "@/lib/api/conversations";

// catch newMessage pushes and patch the cache so the open thread updates live.
// backend emits the bare message (no .user). receiver only ever gets messages
// from the other person, so synthesize .user from the cached participant.
export function useNewMessageSubscription() {
  const socket = useSocket();
  const queryClient = useQueryClient();

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

      // patch the list: update preview + bump to top. only refetch if this is
      // a brand-new conversation that isn't in the cache yet.
      queryClient.setQueryData<ConversationPreview[]>(
        ["conversations"],
        (old) => {
          if (!old) return old;
          const idx = old.findIndex((c) => c.id === message.conversationId);
          if (idx === -1) {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            return old;
          }
          const bumped = { ...old[idx], messages: [message] };
          return [bumped, ...old.slice(0, idx), ...old.slice(idx + 1)];
        },
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, queryClient]);
}

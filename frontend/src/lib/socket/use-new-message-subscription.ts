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
      // append to the open thread if it's loaded
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", message.conversationId],
        (old) => {
          if (!old) return old;
          if (old.messages.some((m) => m.id === message.id)) return old; // dedupe
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

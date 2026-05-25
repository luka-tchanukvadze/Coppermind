"use client";

import { MoreHorizontal, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUnsendMessage } from "@/lib/api/conversations";
import type { Message } from "@/types/schema";

export function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const unsend = useUnsendMessage();

  // optimistic messages have a temp id - can't unsend before the server confirms
  const canUnsend = isMe && !message.id.startsWith("temp-");

  const handleUnsend = () => {
    unsend.mutate(
      { conversationId: message.conversationId, messageId: message.id },
      {
        onSuccess: () => toast.success("Message unsent"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    // Outer is the bubble itself + holds the absolutely-positioned dropdown.
    // `max-w-[85%]` uses a percentage of the message-list column (which has a
    // known width via max-w-2xl), so it actually applies. We don't put the
    // dropdown in a flex row anymore - it would steal layout space and push
    // short bubbles like "yes" away from the edge.
    <div
      className={cn(
        "group relative max-w-[85%] rounded-md px-3.5 py-2 text-sm leading-relaxed",
        // wrap-anywhere lets long unbreakable strings (URLs, single-word
        // tokens) wrap inside the bubble instead of forcing it to overflow.
        "wrap-anywhere",
        isMe ? "bg-accent text-white" : "border bg-surface text-ink",
      )}
    >
      {message.text}

      {canUnsend && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Message options"
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted opacity-0 transition-opacity",
                // Position outside the bubble so it never reserves space inside it.
                // For my own messages the bubble sits on the right, so the
                // button hangs off the LEFT side (gap of 6px = -left-7).
                "-left-7",
                "hover:bg-muted-bg hover:text-ink group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuItem
              className="text-error focus:text-error"
              disabled={unsend.isPending}
              onSelect={handleUnsend}
            >
              <Undo2 className="h-3.5 w-3.5" /> Unsend message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

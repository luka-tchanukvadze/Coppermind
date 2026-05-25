"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import { UserPic } from "@/components/shared/user-pic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { cn } from "@/lib/utils";
import {
  useConversation,
  useSendMessage,
  type ConversationDetail,
  type Message,
} from "@/lib/api/conversations";
import { useMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { formatTime, formatShortDate } from "@/lib/format";

type MessageGroup = { userId: string; messages: Message[] };

// collapse consecutive messages from the same sender into one group
function groupConsecutive(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.userId === m.userId) last.messages.push(m);
    else groups.push({ userId: m.userId, messages: [m] });
  }
  return groups;
}

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: conversation, isLoading, error } = useConversation(conversationId);
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const sendMessage = useSendMessage();

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];

  // scroll to newest whenever the count changes (open thread + incoming)
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) notFound();
  if (error || !conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Could not load this conversation.
      </div>
    );
  }

  const other = conversation.participants[0]?.user;
  const groups = groupConsecutive(messages);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !other || !me) return;
    setText("");

    // optimistic: show my message instantly, reconciled by the onSuccess refetch
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
      userId: me.id,
      conversationId,
      user: { id: me.id, name: me.name, photo: me.photo },
    };
    queryClient.setQueryData<ConversationDetail>(
      ["conversation", conversationId],
      (old) => (old ? { ...old, messages: [...old.messages, optimistic] } : old),
    );

    sendMessage.mutate(
      { friendId: other.id, text: trimmed },
      {
        onError: (err) => {
          // roll back the optimistic message
          queryClient.setQueryData<ConversationDetail>(
            ["conversation", conversationId],
            (old) =>
              old
                ? {
                    ...old,
                    messages: old.messages.filter((m) => m.id !== optimistic.id),
                  }
                : old,
          );
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/chat"
          aria-label="Back to conversations"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink hover:bg-muted-bg md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <UserPic photo={other?.photo} name={other?.name ?? ""} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink">{other?.name}</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-5">
          {groups.map((g, i) => {
            const isMe = g.userId === me?.id;
            const firstDate = g.messages[0].createdAt;
            const showDate =
              i === 0 ||
              formatShortDate(firstDate) !==
                formatShortDate(groups[i - 1].messages.at(-1)!.createdAt);
            return (
              <div key={g.messages[0].id}>
                {showDate && (
                  <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
                    <div className="h-px flex-1 bg-border" />
                    <span>{formatShortDate(firstDate)}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                  {g.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} isMe={isMe} />
                  ))}
                  <div className="mt-0.5 text-[11px] text-muted">
                    {formatTime(g.messages.at(-1)!.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="border-t bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-2xl items-center gap-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Insert emoji"
            className="hidden sm:flex"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${other?.name?.split(" ")[0] ?? ""}...`}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

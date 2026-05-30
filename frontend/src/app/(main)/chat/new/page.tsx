"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { UserPic } from "@/components/shared/user-pic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiButton } from "@/components/chat/emoji-button";
import { useConversations, useSendMessage } from "@/lib/api/conversations";
import { useUser } from "@/lib/api/users";

export default function NewChatPage() {
  return (
    <Suspense fallback={null}>
      <NewChatContent />
    </Suspense>
  );
}

function NewChatContent() {
  const searchParams = useSearchParams();
  const friendId = searchParams.get("friendId");
  const router = useRouter();

  const { data: conversations } = useConversations();
  const { data: friend, isLoading: friendLoading } = useUser(friendId ?? "");
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");

  // already have a thread with this friend? jump straight to it
  const existing = conversations?.find(
    (c) => c.participants[0]?.user.id === friendId,
  );
  useEffect(() => {
    if (existing) router.replace(`/chat/${existing.id}`);
  }, [existing, router]);

  if (!friendId) notFound();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    // no optimistic UI on this page (we navigate away on success) but still
    // pass clientMessageId for backend dedupe symmetry
    const clientMessageId = crypto.randomUUID();
    sendMessage.mutate(
      { friendId, text: trimmed, clientMessageId },
      {
        // backend creates the conversation on first send - jump to the real room
        onSuccess: (message) => router.replace(`/chat/${message.conversationId}`),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/chat"
          aria-label="Back to conversations"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink hover:bg-muted-bg md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <UserPic photo={friend?.photo} name={friend?.name ?? ""} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink">{friend?.name}</div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted">
        {friendLoading
          ? "Loading..."
          : `Say hi to ${friend?.name?.split(" ")[0] ?? "your friend"}.`}
      </div>

      <footer className="shrink-0 border-t bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-2xl items-center gap-2"
        >
          <EmojiButton onPick={(emoji) => setText((t) => t + emoji)} />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${friend?.name?.split(" ")[0] ?? ""}...`}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

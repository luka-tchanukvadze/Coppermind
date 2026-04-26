import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, Smile } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { cn } from "@/lib/utils";
import { messagesFor, conversationOther, currentUser } from "@/lib/mocks/dummy";
import { formatTime, formatShortDate } from "@/lib/format";

export default async function ChatRoomPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const other = conversationOther(conversationId);
  if (!other) notFound();
  const messages = messagesFor(conversationId);
  const me = currentUser();

  type Group = { userId: string; messages: typeof messages };
  const groups: Group[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.userId === m.userId) last.messages.push(m);
    else groups.push({ userId: m.userId, messages: [m] });
  }

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
        <UserPic photo={other.photo} name={other.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink">{other.name}</div>
          <div className="truncate text-xs text-muted">{other.email}</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-5">
          {groups.map((g, i) => {
            const isMe = g.userId === me.id;
            const firstDate = g.messages[0].createdAt;
            const showDate =
              i === 0 ||
              formatShortDate(firstDate) !==
                formatShortDate(groups[i - 1].messages.at(-1)!.createdAt);
            return (
              <div key={i}>
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
        </div>
      </div>

      <footer className="border-t bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Insert emoji" className="hidden sm:flex">
            <Smile className="h-4 w-4" />
          </Button>
          <Input placeholder={`Message ${other.name.split(" ")[0]}...`} className="flex-1" />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

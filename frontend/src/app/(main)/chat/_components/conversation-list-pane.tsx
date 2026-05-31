"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { OnlineDot } from "@/components/shared/online-dot";
import { ConversationListSkeleton } from "@/components/chat/chat-skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConversations } from "@/lib/api/conversations";
import { useMe } from "@/lib/api/users";
import { formatRelative } from "@/lib/format";

interface ConversationListPaneProps {
  activeConvoId: string | null;
  hideOnMobile: boolean;
}

export function ConversationListPane({ activeConvoId, hideOnMobile }: ConversationListPaneProps) {
  const { data: convos = [], isLoading } = useConversations();
  const { data: me } = useMe();
  const [search, setSearch] = useState("");

  // client-side filter on the already-loaded list. matches the other person's
  // name - cheap and what users expect from a sidebar search
  const q = search.trim().toLowerCase();
  const filtered = q
    ? convos.filter((c) => c.participants[0]?.user.name.toLowerCase().includes(q))
    : convos;

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col border-r bg-surface/50 md:w-85",
        hideOnMobile ? "hidden md:flex" : "flex",
      )}
    >
      <header className="border-b px-5 py-5">
        <h2 className="font-serif text-xl font-medium leading-tight text-ink">Conversations</h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            className="h-9 pl-9 text-sm"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? (
        <ConversationListSkeleton />
      ) : convos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">
          No conversations yet. Pick a{" "}
          <Link href="/friends" className="font-medium text-accent hover:underline">
            friend
          </Link>{" "}
          to send the first message.
        </p>
      ) : filtered.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">
          No conversations matching &ldquo;{search}&rdquo;.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const other = c.participants[0]?.user;
            const lastMessage = c.messages[0];
            const isMine = lastMessage?.userId === me?.id;
            const isActive = activeConvoId === c.id;
            // viewing the thread marks it read, so never show unread on the
            // active one (avoids a flash before mark-read resolves)
            const hasUnread = c.unreadCount > 0 && !isActive;
            return (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/60 px-5 py-3.5 transition-colors",
                    isActive ? "bg-accent-soft" : "hover:bg-muted-bg/40",
                  )}
                >
                  <div className="relative shrink-0">
                    <UserPic photo={other?.photo} name={other?.name ?? ""} size="md" />
                    {other?.id && <OnlineDot userId={other.id} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate font-medium",
                        isActive ? "text-accent" : "text-ink",
                      )}
                    >
                      {other?.name}
                    </span>
                    {/* timestamp leads the preview so it reads as "when the
                        last message was sent", not an ambiguous bare time */}
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        // unread: darken + bold the preview so the row reads
                        // as "new", matching the count badge
                        hasUnread ? "font-medium text-ink" : "text-muted",
                      )}
                    >
                      {lastMessage ? (
                        <>
                          <span>{formatRelative(lastMessage.createdAt)}</span>
                          {" · "}
                          {isMine ? `You: ${lastMessage.text}` : lastMessage.text}
                        </>
                      ) : (
                        "No messages yet."
                      )}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="mt-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-semibold text-white">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

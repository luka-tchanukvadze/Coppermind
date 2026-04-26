"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { conversationPreviews, currentUser } from "@/lib/mocks/dummy";
import { formatRelative } from "@/lib/format";

interface ConversationListPaneProps {
  activeConvoId: string | null;
  hideOnMobile: boolean;
}

export function ConversationListPane({ activeConvoId, hideOnMobile }: ConversationListPaneProps) {
  const convos = conversationPreviews();
  const me = currentUser();

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
          <Input className="h-9 pl-9 text-sm" placeholder="Search..." />
        </div>
      </header>

      <ul className="flex-1 overflow-y-auto">
        {convos.map((c) => {
          const isMine = c.lastMessage?.userId === me.id;
          const isActive = activeConvoId === c.id;
          return (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className={cn(
                  "flex items-start gap-3 border-b border-border/60 px-5 py-3.5 transition-colors",
                  isActive ? "bg-accent-soft" : "hover:bg-muted-bg/40",
                )}
              >
                <UserPic photo={c.other.photo} name={c.other.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("truncate font-medium", isActive ? "text-accent" : "text-ink")}>
                      {c.other.name}
                    </span>
                    {c.lastMessage && (
                      <span className="shrink-0 text-[11px] text-muted">
                        {formatRelative(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {c.lastMessage
                      ? isMine
                        ? `You: ${c.lastMessage.text}`
                        : c.lastMessage.text
                      : "No messages yet."}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

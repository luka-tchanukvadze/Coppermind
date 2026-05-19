"use client";

import Link from "next/link";
import { MessageCircle, BookOpen } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { Button } from "@/components/ui/button";
import { FriendCardMenu } from "./friend-card-menu";
import { useUserBooksForUser } from "@/lib/api/user-books";
import type { FriendUser } from "@/lib/api/friends";

/* TODO N+1 - useUserBooksForUser fires per card.
   needs backend aggregate: include READING progress + book count in /friends payload,
   or new endpoint GET /friends/with-activity */
export function FriendCard({ friend }: { friend: FriendUser }) {
  const { data: shelf = [] } = useUserBooksForUser(friend.id);
  const currentRead = shelf.find((ub) => ub.progress === "READING");
  const book = currentRead?.book ?? null;

  return (
    <article className="flex flex-col gap-4 rounded-md border bg-surface p-5">
      <div className="flex items-start gap-3">
        <UserPic photo={friend.photo} name={friend.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${friend.id}`}
            className="block truncate font-serif text-lg font-medium text-ink hover:text-accent"
          >
            {friend.name}
          </Link>
          {book ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <BookOpen className="h-3 w-3" />
              <span className="truncate italic">Reading {book.title}</span>
            </div>
          ) : (
            <div className="mt-0.5 text-xs text-muted">No active read</div>
          )}
          <div className="mt-1 text-xs text-muted">
            {shelf.length} books on shelf
          </div>
        </div>
        <FriendCardMenu friendName={friend.name} friendId={friend.id} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" asChild className="flex-1">
          <Link href="/chat">
            <MessageCircle className="h-3.5 w-3.5" /> Message
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="flex-1">
          <Link href={`/profile/${friend.id}`}>View shelf</Link>
        </Button>
      </div>
    </article>
  );
}

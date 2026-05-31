"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Search, X } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProfileEmpty } from "./profile-empty";
import { formatShortDate, progressLabel } from "@/lib/format";
import type { UserBookWithBook } from "@/types/schema";

// only show the search box once the shelf is big enough to be worth filtering
const SEARCH_THRESHOLD = 8;

export function ProfileShelfTab({
  books,
  linkToOwnShelf,
}: {
  books: UserBookWithBook[];
  linkToOwnShelf: boolean;
}) {
  const [query, setQuery] = useState("");

  // live filter over title + author on the already-loaded public shelf
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.book.title.toLowerCase().includes(q) ||
        b.book.author.toLowerCase().includes(q),
    );
  }, [books, query]);

  if (books.length === 0) return <ProfileEmpty label="No books yet." />;

  return (
    <div>
      {books.length > SEARCH_THRESHOLD && (
        <div className="relative mb-4 w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="w-full pl-9 pr-9"
            placeholder="Search this shelf..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <ProfileEmpty label={`No books matching "${query}".`} />
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((ub) => (
            <li key={ub.id}>
              <Link
                href={linkToOwnShelf ? `/shelf/${ub.id}` : `/books/${ub.book.id}`}
                className="flex items-center gap-3 py-4 transition-colors hover:bg-muted-bg/30 sm:gap-4"
              >
                <BookCover coverImage={ub.book.coverImage} title={ub.book.title} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-serif text-base font-medium text-ink">
                      {ub.book.title}
                    </div>
                    {ub.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted" />}
                  </div>
                  <div className="truncate text-sm italic text-muted">{ub.book.author}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    Added {formatShortDate(ub.createdAt)}
                  </div>
                </div>
                <Badge
                  variant={ub.progress === "READING" ? "default" : ub.progress === "READ" ? "gold" : "muted"}
                  className="shrink-0"
                >
                  {progressLabel(ub.progress)}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

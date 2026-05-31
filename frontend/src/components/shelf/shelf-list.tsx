import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, progressLabel } from "@/lib/format";
import type { UserBookWithBook } from "@/types/schema";

export function ShelfList({
  books,
  emptyMessage = "Nothing here yet.",
}: {
  books: UserBookWithBook[];
  // overridden when a search is active so the empty state reads as "no
  // matches" rather than "empty shelf"
  emptyMessage?: string;
}) {
  if (books.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {books.map((ub) => (
        <li key={ub.id}>
          <Link
            href={`/shelf/${ub.id}`}
            className="group flex items-center gap-3 py-4 transition-colors hover:bg-muted-bg/30 sm:gap-5 sm:py-5"
          >
            <BookCover
              coverImage={ub.book.coverImage}
              title={ub.book.title}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-serif text-base font-medium text-ink group-hover:text-accent">
                  {ub.book.title}
                </h3>
                {ub.isPrivate && (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted" />
                )}
              </div>
              <div className="truncate text-sm italic text-muted">
                {ub.book.author}
              </div>
              <div className="mt-1 text-xs text-muted">
                Added {formatShortDate(ub.createdAt)}
                {ub.customDataCount > 0 && (
                  <span>
                    {" "}
                    · {ub.customDataCount}{" "}
                    {ub.customDataCount === 1 ? "entry" : "entries"}
                  </span>
                )}
              </div>
            </div>

            <Badge
              variant={
                ub.progress === "READING"
                  ? "default"
                  : ub.progress === "READ"
                    ? "gold"
                    : "muted"
              }
              className="shrink-0"
            >
              {progressLabel(ub.progress)}
            </Badge>

            <div className="hidden items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100 sm:inline-flex">
              View notes <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

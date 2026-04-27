import Link from "next/link";
import { Lock } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { ProfileEmpty } from "./profile-empty";
import { formatShortDate, progressLabel } from "@/lib/format";
import type { UserBookWithBook } from "@/types/schema";

export function ProfileShelfTab({
  books,
  linkToOwnShelf,
}: {
  books: UserBookWithBook[];
  linkToOwnShelf: boolean;
}) {
  if (books.length === 0) return <ProfileEmpty label="No books yet." />;

  return (
    <ul className="divide-y divide-border">
      {books.map((ub) => (
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
  );
}

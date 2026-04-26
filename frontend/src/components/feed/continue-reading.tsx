import Link from "next/link";
import { ArrowUpRight, NotebookPen } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { userBooksWithBook } from "@/lib/mocks/dummy";
import { formatShortDate } from "@/lib/format";

export function ContinueReading() {
  const reading = userBooksWithBook().filter((ub) => ub.progress === "READING");
  if (reading.length === 0) return null;

  return (
    <section className="mb-10">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink">Continue reading</h2>
          <p className="mt-0.5 text-sm text-muted">Pick up where you left off.</p>
        </div>
        <Link href="/shelf" className="text-sm font-medium text-accent hover:underline">
          All shelves →
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reading.map((ub) => (
          <Link
            key={ub.id}
            href={`/shelf/${ub.id}`}
            className="group flex gap-4 rounded-md border bg-surface p-4 transition-colors hover:border-border-strong"
          >
            <BookCover coverImage={ub.book.coverImage} title={ub.book.title} size="md" />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <h3 className="line-clamp-2 font-serif text-base font-medium leading-tight text-ink group-hover:text-accent">
                  {ub.book.title}
                </h3>
                <p className="mt-0.5 truncate text-sm italic text-muted">{ub.book.author}</p>
              </div>
              <div className="text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <NotebookPen className="h-3 w-3" />
                  <span>
                    {ub.customDataCount} {ub.customDataCount === 1 ? "entry" : "entries"}
                  </span>
                </div>
                {ub.progressUpdatedAt && (
                  <div className="mt-1">Last opened {formatShortDate(ub.progressUpdatedAt)}</div>
                )}
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

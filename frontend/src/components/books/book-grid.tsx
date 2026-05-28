"use client";

import Link from "next/link";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/types/schema";

interface BookGridProps {
  books: Book[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // shown when the filtered set is empty so the page can explain WHY
  // (no books at all vs. nothing in this genre)
  emptyMessage?: string;
}

export function BookGrid({
  books,
  page,
  totalPages,
  onPageChange,
  emptyMessage = "No books to show.",
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="group block"
          >
            <BookCover
              coverImage={book.coverImage}
              title={book.title}
              author={book.author}
              size="lg"
              className="w-full transition-transform group-hover:-translate-y-0.5"
            />
            <div className="mt-3 space-y-0.5">
              <div className="line-clamp-2 font-serif text-[15px] font-medium leading-tight text-ink group-hover:text-accent">
                {book.title}
              </div>
              <div className="truncate text-xs italic text-muted">
                {book.author}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {book.genres.slice(0, 2).map((g) => (
                  <Badge key={g} variant="muted" className="text-[10px]">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between text-sm text-muted">
          <button
            type="button"
            className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>

          <div>
            Page <span className="font-medium text-ink">{page}</span> of {totalPages}
          </div>

          <button
            type="button"
            className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

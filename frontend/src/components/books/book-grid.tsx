"use client";

import Link from "next/link";
import { useBooks } from "@/lib/api/books";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BookGridProps {
  page: number;
  limit?: number;
  onPageChange: (page: number) => void;
}

export function BookGrid({ page, limit = 20, onPageChange }: BookGridProps) {
  const { data, isLoading, error } = useBooks(page, limit);

  // loading - skeletons mirror the data grid so layout doesn't shift on swap
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-2/3 w-full" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // error - react-query already retried 5xx twice, so by here the user is genuinely stuck
  if (error) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load books. Try again in a moment.
      </div>
    );
  }

  // empty - covers no-books-yet and out-of-range page in one branch
  if (!data || data.books.length === 0) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        {page > 1
          ? "No more books on this page."
          : "No books in the catalog yet."}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.books.map((book) => (
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

      <div className="mt-12 flex items-center justify-between text-sm text-muted">
        <button
          type="button"
          className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          ← Previous
        </button>

        <div>
          Page <span className="font-medium text-ink">{data.page}</span> of{" "}
          {data.totalPages}
        </div>

        <button
          type="button"
          className="hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= data.totalPages}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next →
        </button>
      </div>
    </>
  );
}

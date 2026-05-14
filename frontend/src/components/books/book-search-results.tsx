"use client";

import { useSearchBooks } from "@/lib/api/books";
import { BookCover } from "@/components/shared/book-cover";
import { AddToShelfButton } from "@/components/shelf/add-to-shelf-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { BookSearchResult } from "@/types/schema";

interface BookSearchResultsProps {
  query: string;
}

export function BookSearchResults({ query }: BookSearchResultsProps) {
  const { data, isLoading, error } = useSearchBooks(query);

  const books: BookSearchResult[] = data?.books ?? [];
  const source: "google" | "openlibrary" | undefined = data?.source;

  // loading - skeleton rows match the data row shape so layout doesn't jump
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-lg border bg-surface p-4"
          >
            <Skeleton className="aspect-2/3 w-13 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-9 w-48 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // error - same panel style as BookGrid for consistency
  if (error) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not search. Try again in a moment.
      </div>
    );
  }

  // empty - "no results for X"
  if (!books.length) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        No results for &quot;{query}&quot;.
      </div>
    );
  }

  // data - rows with cover, info, and add button
  return (
    <div>
      {source && (
        <p className="mb-3 text-xs text-muted">
          Results from {source === "google" ? "Google Books" : "Open Library"}
        </p>
      )}

      <div className="space-y-3">
        {books.map((book) => (
          <div
            key={book.externalApiId}
            className="flex items-start gap-4 rounded-lg border bg-surface p-4"
          >
            <BookCover
              coverImage={book.coverImage}
              title={book.title}
              author={book.author}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-serif text-base font-medium text-ink">
                {book.title}
              </h3>
              <p className="text-sm italic text-muted">{book.author}</p>
              {book.genres.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {book.genres.slice(0, 2).map((g) => (
                    <Badge key={g} variant="muted" className="text-[10px]">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="w-48 shrink-0">
              <AddToShelfButton book={book} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

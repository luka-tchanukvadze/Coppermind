"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BookGrid } from "@/components/books/book-grid";
import { BookSearchResults } from "@/components/books/book-search-results";
import { useBookGenres, useBooks } from "@/lib/api/books";

const ALL = "All";

const PAGE_SIZE = 30;

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>(ALL);

  const isSearching = query.trim().length > 2;

  // parse ?page= and clamp to >=1 so ?page=-3 or ?page=foo can't break the grid
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const handlePageChange = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    router.push(`/books?${params.toString()}`);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    // reset to page 1 - filtered set has its own page count
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    router.push(`/books?${params.toString()}`);
  };

  // chips and grid pull from separate endpoints. chips need the full catalog
  // tally (independent of pagination); grid only needs the current page
  const { data: genreData } = useBookGenres();
  const { data, isLoading, error } = useBooks(
    page,
    PAGE_SIZE,
    selectedGenre === ALL ? undefined : selectedGenre,
  );

  return (
    <>
      <PageHeader
        title="Books"
        subtitle={
          isSearching ? `Searching "${query}"...` : "Browse the catalog."
        }
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="w-full pl-9 pr-9"
              placeholder="Search title or author..."
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
        }
      />

      {!isSearching && genreData && genreData.total > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <GenreChip
            label={`${ALL} (${genreData.total})`}
            active={selectedGenre === ALL}
            onClick={() => handleGenreSelect(ALL)}
          />
          {genreData.genres.map(({ genre, count }) => (
            <GenreChip
              key={genre}
              label={`${genre} (${count})`}
              active={selectedGenre === genre}
              onClick={() => handleGenreSelect(genre)}
            />
          ))}
        </div>
      )}

      {isSearching ? (
        <BookSearchResults query={query} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-2/3 w-full" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
          Could not load books. Try again in a moment.
        </div>
      ) : (
        <BookGrid
          books={data?.books ?? []}
          page={data?.page ?? page}
          totalPages={data?.totalPages ?? 1}
          onPageChange={handlePageChange}
          emptyMessage={
            selectedGenre === ALL
              ? "No books in the catalog yet."
              : `No books tagged "${selectedGenre}" yet.`
          }
        />
      )}
    </>
  );
}

function GenreChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent text-white"
          : "border-border-strong text-muted hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </button>
  );
}

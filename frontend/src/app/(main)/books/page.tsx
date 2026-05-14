"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookGrid } from "@/components/books/book-grid";
import { useState } from "react";
import { BookSearchResults } from "@/components/books/book-search-results";

const GENRES = [
  "All",
  "Fiction",
  "Non-fiction",
  "Sci-fi & Fantasy",
  "Mystery",
  "Poetry",
  "Memoir",
  "Historical",
  "Literary",
  "Science",
];

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");

  const isSearching = query.trim().length > 2;

  // parse ?page= and clamp to >=1 so ?page=-3 or ?page=foo can't break the grid
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const handlePageChange = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    router.push(`/books?${params.toString()}`);
  };

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
      {!isSearching && (
        <div className="mb-8 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                g === "All"
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong text-muted hover:border-accent hover:text-accent",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}
      {isSearching ? (
        <BookSearchResults query={query} />
      ) : (
        <BookGrid page={page} limit={20} onPageChange={handlePageChange} />
      )}
    </>
  );
}

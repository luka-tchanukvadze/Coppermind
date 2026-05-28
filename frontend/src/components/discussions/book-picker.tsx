"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/shared/book-cover";
import { useBooks } from "@/lib/api/books";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { Book } from "@/types/schema";

interface BookPickerProps {
  // controlled - parent owns the selected book so it can submit bookId
  value: Book | null;
  onChange: (book: Book | null) => void;
}

// catalog is tiny (<100 books for now) so client-side filter is fine.
// when the catalog grows, switch to a server-side /books?q= endpoint
export function BookPicker({ value, onChange }: BookPickerProps) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const { data: catalog } = useBooks(1, 100);

  const matches = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (q.length < 1) return [];
    const books = catalog?.books ?? [];
    return books
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [debounced, catalog]);

  // selected state: show a chip with cover + title + clear button
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-surface p-3">
        <BookCover coverImage={value.coverImage} title={value.title} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink">{value.title}</div>
          <div className="truncate text-xs italic text-muted">{value.author}</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove book"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    // relative wrapper lets the dropdown float over the description below
    // instead of pushing it down out of view
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          className="pl-9"
          placeholder="Search the catalog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {matches.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border bg-surface shadow-md">
          {matches.map((book) => (
            <li key={book.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted-bg/60"
                onClick={() => {
                  onChange(book);
                  setQuery("");
                }}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{book.title}</div>
                  <div className="truncate text-xs italic text-muted">{book.author}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {debounced.trim().length > 0 && matches.length === 0 && (
        <p className="mt-2 text-xs text-muted">No matches in the catalog.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BookCover } from "@/components/shared/book-cover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BOOKS } from "@/lib/mocks/dummy";
import { cn } from "@/lib/utils";

const GENRES = ["All", "Fiction", "Non-fiction", "Sci-fi & Fantasy", "Mystery", "Poetry", "Memoir", "Historical", "Literary", "Science"];

export default function BooksPage() {
  return (
    <>
      <PageHeader
        title="Books"
        subtitle={`${BOOKS.length} titles in the catalog.`}
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="w-full pl-9" placeholder="Search title or author..." />
          </div>
        }
      />

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

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {BOOKS.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`} className="group block">
            <BookCover coverImage={book.coverImage} title={book.title} author={book.author} size="lg" className="w-full transition-transform group-hover:-translate-y-0.5" />
            <div className="mt-3 space-y-0.5">
              <div className="line-clamp-2 font-serif text-[15px] font-medium leading-tight text-ink group-hover:text-accent">
                {book.title}
              </div>
              <div className="truncate text-xs italic text-muted">{book.author}</div>
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
        <button type="button" className="hover:text-ink">← Previous</button>
        <div>
          Page <span className="font-medium text-ink">1</span> of 8
        </div>
        <button type="button" className="hover:text-ink">Next →</button>
      </div>
    </>
  );
}

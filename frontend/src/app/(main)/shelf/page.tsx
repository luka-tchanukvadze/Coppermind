"use client";
import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BookCover } from "@/components/shared/book-cover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate, progressLabel } from "@/lib/format";
import type { UserBookWithBook } from "@/types/schema";
import { useUserBooks } from "@/lib/api/user-books";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShelfPage() {
  const { data: shelf, isLoading, error } = useUserBooks(1, 100);
  const books = shelf ?? [];
  const byStatus = {
    all: books,
    want: books.filter((b) => b.progress === "WANT_TO_READ"),
    reading: books.filter((b) => b.progress === "READING"),
    read: books.filter((b) => b.progress === "READ"),
  };

  // loading - skeleton rows match the list shape so layout doesn't jump
  if (isLoading) {
    return (
      <ul className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 py-4 sm:gap-5 sm:py-5">
            <Skeleton className="aspect-2/3 w-13 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0" />
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load your shelf. Try again in a moment.
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Your shelf is empty. Search for a book to add one.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My shelf"
        subtitle={`${books.length} books on your shelf.`}
        actions={
          <Select defaultValue="added">
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="added">Recently added</SelectItem>
              <SelectItem value="updated">Last updated</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="author">Author A-Z</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({byStatus.all.length})</TabsTrigger>
          <TabsTrigger value="want">
            Want to read ({byStatus.want.length})
          </TabsTrigger>
          <TabsTrigger value="reading">
            Reading ({byStatus.reading.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Finished ({byStatus.read.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ShelfList books={byStatus.all} />
        </TabsContent>
        <TabsContent value="want">
          <ShelfList books={byStatus.want} />
        </TabsContent>
        <TabsContent value="reading">
          <ShelfList books={byStatus.reading} />
        </TabsContent>
        <TabsContent value="read">
          <ShelfList books={byStatus.read} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ShelfList({ books }: { books: UserBookWithBook[] }) {
  if (books.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted">
        Nothing here yet.
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

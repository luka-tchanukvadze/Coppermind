"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserBooks } from "@/lib/api/user-books";
import { ShelfList } from "@/components/shelf/shelf-list";
import { ShelfListSkeleton } from "@/components/shelf/shelf-list-skeleton";
import type { UserBookWithBook } from "@/types/schema";

type SortKey = "added" | "updated" | "title" | "author";

// each sort runs on the already-fetched shelf - cheap, no extra fetch.
// dates are ISO strings so localeCompare gives the right order without
// parsing to Date. nulls land at the bottom for "updated"
function sortBooks(books: UserBookWithBook[], key: SortKey): UserBookWithBook[] {
  const copy = [...books];
  switch (key) {
    case "added":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "updated":
      return copy.sort((a, b) =>
        (b.progressUpdatedAt ?? "").localeCompare(a.progressUpdatedAt ?? ""),
      );
    case "title":
      return copy.sort((a, b) => a.book.title.localeCompare(b.book.title));
    case "author":
      return copy.sort((a, b) => a.book.author.localeCompare(b.book.author));
  }
}

export default function ShelfPage() {
  const { data: shelf, isLoading, error } = useUserBooks(1, 100);
  const [sortKey, setSortKey] = useState<SortKey>("added");

  const sorted = useMemo(
    () => sortBooks(shelf ?? [], sortKey),
    [shelf, sortKey],
  );

  const books = sorted;
  const byStatus = {
    all: books,
    want: books.filter((b) => b.progress === "WANT_TO_READ"),
    reading: books.filter((b) => b.progress === "READING"),
    read: books.filter((b) => b.progress === "READ"),
  };

  if (isLoading) return <ShelfListSkeleton />;

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
        Your shelf is empty. Head to the{" "}
        <Link href="/books" className="font-medium text-accent hover:underline">
          catalog
        </Link>{" "}
        and add your first book.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My shelf"
        subtitle={`${books.length} books on your shelf.`}
        actions={
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
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

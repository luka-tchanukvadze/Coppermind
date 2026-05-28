"use client";
import { notFound, useParams } from "next/navigation";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookActions } from "./_components/book-actions";
import { ReadersTab } from "./_components/readers-tab";
import { PublicNotesTab } from "./_components/public-notes-tab";
import { RelatedDiscussionsTab } from "./_components/related-discussions-tab";
import { NewDiscussionDialog } from "@/components/discussions/new-discussion-dialog";
import {
  useBook,
  useBookReaders,
  useBookPublicNotes,
  useBookDiscussions,
} from "@/lib/api/books";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";

// small inline panel for the tab body during load/error - matches the empty-state shell
function TabPanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id);
  const { data: readers, isLoading: readersLoading, error: readersError } =
    useBookReaders(id);
  const { data: notes, isLoading: notesLoading, error: notesError } =
    useBookPublicNotes(id);
  const {
    data: discussions,
    isLoading: discussionsLoading,
    error: discussionsError,
  } = useBookDiscussions(id);

  if (isLoading) return <Skeleton className="aspect-2/3 w-65" />;
  if (error && error instanceof ApiError && error.status === 404) notFound();
  if (error)
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load book. Try again in a moment.
      </div>
    );
  if (!book) notFound();

  return (
    <div className="grid gap-8 pb-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-10">
      <div className="mx-auto w-full max-w-65 md:mx-0 md:max-w-none">
        <BookCover
          coverImage={book.coverImage}
          title={book.title}
          author={book.author}
          size="xl"
          className="w-full"
        />
        <BookActions book={book} />
      </div>

      <div className="min-w-0 pt-2">
        <h1 className="wrap-break-word font-serif text-3xl font-medium leading-[1.1] text-ink sm:text-4xl md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-2 wrap-break-word text-base italic text-muted sm:text-lg">
          by {book.author}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {book.genres.map((g) => (
            <Badge key={g} variant="outline">
              {g}
            </Badge>
          ))}
        </div>

        <div className="mt-10 border-t pt-10">
          <Tabs defaultValue="readers">
            <TabsList className="flex-wrap">
              <TabsTrigger value="readers">Readers</TabsTrigger>
              <TabsTrigger value="notes">Public notes</TabsTrigger>
              <TabsTrigger value="discussions">Related discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="readers">
              {readersLoading ? (
                <TabPanelMessage>Loading readers...</TabPanelMessage>
              ) : readersError ? (
                <TabPanelMessage>Could not load readers.</TabPanelMessage>
              ) : (
                <ReadersTab readers={readers ?? []} />
              )}
            </TabsContent>

            <TabsContent value="notes">
              {notesLoading ? (
                <TabPanelMessage>Loading notes...</TabPanelMessage>
              ) : notesError ? (
                <TabPanelMessage>Could not load public notes.</TabPanelMessage>
              ) : (
                <PublicNotesTab notes={notes ?? []} />
              )}
            </TabsContent>

            <TabsContent value="discussions">
              {/* preselect this book when starting a thread from here */}
              <div className="mb-4 flex justify-end">
                <NewDiscussionDialog
                  preselectedBook={book}
                  trigger={
                    <Button size="sm">
                      <Plus className="h-3.5 w-3.5" /> Start a discussion
                    </Button>
                  }
                />
              </div>
              {discussionsLoading ? (
                <TabPanelMessage>Loading discussions...</TabPanelMessage>
              ) : discussionsError ? (
                <TabPanelMessage>Could not load discussions.</TabPanelMessage>
              ) : (
                <RelatedDiscussionsTab discussions={discussions ?? []} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

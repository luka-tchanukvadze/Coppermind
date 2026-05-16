"use client";
import { useParams, notFound } from "next/navigation";
import { BackBar } from "./_components/back-bar";
import { UserBookAside } from "./_components/userbook-aside";
import { UserBookEntries } from "./_components/userbook-entries";
import { useUserBook } from "@/lib/api/user-books";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserBookDetailPage() {
  const { userBookId } = useParams<{ userBookId: string }>();
  const { data: userBook, isLoading, error } = useUserBook(userBookId);

  if (isLoading) {
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-64 lg:mx-0 lg:max-w-none">
          <Skeleton className="aspect-2/3 w-full" />
          <Skeleton className="mt-6 h-7 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) notFound();

  if (error) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load this entry. Try again in a moment.
      </div>
    );
  }

  if (!userBook) notFound();

  return (
    <>
      <BackBar />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <UserBookAside
          userBook={userBook}
          book={userBook.book}
          entryCount={userBook.customData.length}
        />
        <UserBookEntries entries={userBook.customData} />
      </div>
    </>
  );
}

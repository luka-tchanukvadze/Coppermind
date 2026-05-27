"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { FeedCard } from "@/components/feed/feed-card";
import {
  FeedActivitySkeleton,
  FriendsReadingSkeleton,
} from "@/components/feed/feed-skeleton";
import { ContinueReading } from "@/components/feed/continue-reading";
import { Recommendations } from "@/components/feed/recommendations";
import { UserPic } from "@/components/shared/user-pic";
import { useFeed } from "@/lib/api/feed";
import { useMe } from "@/lib/api/users";

export default function FeedPage() {
  const { data: me } = useMe();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFeed();

  // sentinel for infinite scroll - fetch the next page when this scrolls into view
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      // start loading 200px before the sentinel hits the viewport edge
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // flatten every loaded page into one activity list.
  // friendsReading is the same across pages, so just grab it from page 0.
  const activity = data?.pages.flatMap((p) => p.activity) ?? [];
  const friendsReading = data?.pages[0]?.friendsReading ?? [];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${me?.name?.split(" ")[0] ?? ""}.`}
        subtitle="Your library, your friends, what they're reading today."
      />

      <ContinueReading />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <h2 className="mb-4 font-serif text-xl font-medium text-ink">Around your library</h2>

          {isLoading ? (
            <FeedActivitySkeleton />
          ) : error ? (
            <p className="rounded-md border border-dashed bg-surface/40 p-8 text-center text-sm text-muted">
              Could not load your feed. Try again in a moment.
            </p>
          ) : activity.length === 0 ? (
            <p className="rounded-md border border-dashed bg-surface/40 p-8 text-center text-sm text-muted">
              Your feed is quiet. Add a few friends and start building your shelf - their reading will show up here.
            </p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}

              {/* sentinel - observer-driven load-more */}
              <div
                ref={loadMoreRef}
                className="py-6 text-center text-xs text-muted"
              >
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                    ? "Scroll for more"
                    : "You're all caught up."}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <Recommendations />

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
              Friends reading now
            </h2>
            {isLoading ? (
              <FriendsReadingSkeleton />
            ) : friendsReading.length === 0 ? (
              <p className="text-sm text-muted">Nothing here yet. When your friends pick up a book, you&apos;ll see it.</p>
            ) : (
              <ul className="space-y-2.5">
                {friendsReading.map(({ user, book }) => (
                  <li key={user.id} className="flex items-center gap-3 text-sm">
                    <UserPic photo={user.photo} name={user.name} size="sm" />
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${user.id}`}
                        className="block truncate text-ink hover:text-accent"
                      >
                        {user.name}
                      </Link>
                      <Link
                        href={`/books/${book.id}`}
                        className="block truncate text-xs italic text-muted hover:text-accent"
                      >
                        {book.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

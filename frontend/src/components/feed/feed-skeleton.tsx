import { Skeleton } from "@/components/ui/skeleton";

// matches FeedCard shape so layout doesn't jump on data load
function FeedCardSkeleton() {
  return (
    <article className="rounded-md border bg-surface p-6">
      <header className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </header>
      <div className="mt-4 flex gap-4">
        <Skeleton className="aspect-2/3 w-20 shrink-0" />
        <div className="flex-1 space-y-2 pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </article>
  );
}

export function FeedActivitySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}

// matches the friendsReading list rows in feed/page.tsx
export function FriendsReadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

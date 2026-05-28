import { Skeleton } from "@/components/ui/skeleton";

// matches DiscussionCard shape so layout doesn't jump on data load
function DiscussionCardSkeleton() {
  return (
    <div className="py-5">
      <Skeleton className="h-6 w-3/4" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function DiscussionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <DiscussionCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

// matches the overlapping avatar stack + caption in the sidebar
export function ActiveReadersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <div className="flex items-center">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            className={
              i === 0
                ? "h-8 w-8 rounded-full border-2 border-background"
                : "-ml-2 h-8 w-8 rounded-full border-2 border-background"
            }
          />
        ))}
      </div>
      <Skeleton className="mt-3 h-3 w-32" />
    </>
  );
}

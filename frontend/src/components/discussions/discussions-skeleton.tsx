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

// matches the discussion detail page (back link + article: title, author row,
// body paragraphs, actions bar, a few replies) so it doesn't jump to the real
// layout on load
export function DiscussionDetailSkeleton() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="pb-8">
          {/* title */}
          <Skeleton className="h-9 w-3/4 sm:h-11" />
          {/* author row */}
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* body */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* actions bar */}
        <div className="mt-8 flex items-center gap-3 border-y py-3">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="ml-auto h-7 w-16" />
        </div>

        {/* replies */}
        <div className="mt-12">
          <Skeleton className="h-7 w-28" />
          <ul className="mt-6 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2 rounded-md border bg-surface p-4">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
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

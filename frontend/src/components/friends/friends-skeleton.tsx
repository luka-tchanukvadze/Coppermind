import { Skeleton } from "@/components/ui/skeleton";

// matches FriendCard shape so the grid doesn't jump on data load
function FriendCardSkeleton() {
  return (
    <article className="flex flex-col gap-4 rounded-md border bg-surface p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </article>
  );
}

export function FriendGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <FriendCardSkeleton key={i} />
      ))}
    </div>
  );
}

// matches FindUserCard shape
function FindUserCardSkeleton() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border bg-surface p-5">
      <div className="flex w-full items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

export function FindUserGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <FindUserCardSkeleton key={i} />
      ))}
    </div>
  );
}

// matches IncomingRequestRow / OutgoingRequestRow shape
function RequestRowSkeleton() {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-md border bg-surface p-4 sm:flex-nowrap sm:gap-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </li>
  );
}

export function RequestListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <RequestRowSkeleton key={i} />
      ))}
    </ul>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { ShelfListSkeleton } from "@/components/shelf/shelf-list-skeleton";

// mirrors ProfileBanner + ProfileStats + tabs so the layout doesn't jump
// when the real data swaps in
export function ProfileSkeleton() {
  return (
    <>
      {/* same negative-margin banner as ProfileBanner */}
      <div className="-mx-4 -mt-6 h-35 bg-accent/60 sm:-mx-6 sm:-mt-8 md:-mx-8 md:-mt-10 md:h-45" />

      <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
        <div className="flex items-end gap-4 sm:gap-5">
          <div className="rounded-full border-4 border-background bg-background">
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
          </div>
          <div className="min-w-0 space-y-2 pb-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* 4 stat cards */}
      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border bg-surface p-4">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </dl>

      {/* tabs row + default tab content */}
      <div className="mt-12">
        <div className="flex items-center gap-5 border-b border-border pb-2.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-6">
          <ShelfListSkeleton />
        </div>
      </div>
    </>
  );
}

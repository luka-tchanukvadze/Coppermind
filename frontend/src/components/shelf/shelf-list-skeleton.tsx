import { Skeleton } from "@/components/ui/skeleton";

// matches ShelfList row shape so layout doesn't jump on data load
export function ShelfListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
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

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// placeholder message bubbles while a conversation loads. alternating sides +
// varied widths mimic a real thread so nothing jumps when messages land
const ROWS = [
  { mine: false, w: "w-40" },
  { mine: true, w: "w-28" },
  { mine: false, w: "w-56" },
  { mine: false, w: "w-32" },
  { mine: true, w: "w-44" },
  { mine: true, w: "w-24" },
  { mine: false, w: "w-48" },
  { mine: true, w: "w-36" },
];

export function ChatThreadSkeleton() {
  return (
    <div className="flex-1 overflow-hidden px-6 py-6">
      <div className="mx-auto max-w-2xl space-y-3">
        {ROWS.map((r, i) => (
          <div
            key={i}
            className={cn("flex", r.mine ? "justify-end" : "justify-start")}
          >
            <Skeleton className={cn("h-9 rounded-2xl", r.w)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// placeholder rows for the conversation sidebar: avatar circle + name + preview
export function ConversationListSkeleton() {
  return (
    <ul className="flex-1 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 border-b border-border/60 px-5 py-3.5"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </li>
      ))}
    </ul>
  );
}

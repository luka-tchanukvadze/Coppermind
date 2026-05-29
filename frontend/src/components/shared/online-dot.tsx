"use client";

import { cn } from "@/lib/utils";
import { usePresenceStatus } from "@/lib/presence/presence-provider";

// small status dot anchored bottom-right of a relative container (usually a
// UserPic wrapper). green for active, yellow for idle, hidden when offline.
// parent MUST be position: relative
export function OnlineDot({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const status = usePresenceStatus(userId);
  if (status === "offline") return null;
  return (
    <span
      aria-label={status === "online" ? "Online" : "Away"}
      className={cn(
        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-surface",
        status === "online" ? "bg-green-500" : "bg-amber-400",
        className,
      )}
    />
  );
}

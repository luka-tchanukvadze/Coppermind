"use client";

import {
  usePresenceStatus,
  useLastSeen,
} from "@/lib/presence/presence-provider";
import { formatLastSeen } from "@/lib/format";

/*
  one-line presence text for the chat header. priority:
    isTyping  -> "typing..."
    online    -> "Online"
    away      -> "Away"
    offline + lastSeenAt -> "Last seen Xm ago" / "Last seen recently"
    offline + no lastSeenAt -> null (new user we've never seen offline)
*/
export function PresenceStatus({
  userId,
  lastSeenAt,
  isTyping,
}: {
  userId: string;
  lastSeenAt?: string | null;
  isTyping?: boolean;
}) {
  const status = usePresenceStatus(userId);
  // live value from presence:offline event wins over the (possibly stale)
  // value baked into the conversation API response
  const liveLastSeen = useLastSeen(userId);
  const effectiveLastSeen = liveLastSeen ?? lastSeenAt ?? null;

  if (isTyping) {
    return <span className="text-xs text-accent">typing...</span>;
  }
  if (status === "online") {
    return <span className="text-xs text-muted">Online</span>;
  }
  if (status === "away") {
    return <span className="text-xs text-muted">Away</span>;
  }
  if (effectiveLastSeen) {
    return (
      <span className="text-xs text-muted">{formatLastSeen(effectiveLastSeen)}</span>
    );
  }
  return null;
}

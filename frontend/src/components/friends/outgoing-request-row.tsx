"use client";

import { UserPic } from "@/components/shared/user-pic";
import { CancelRequestButton } from "./cancel-request-button";
import { formatRelative } from "@/lib/format";
import type { FriendUser } from "@/lib/api/friends";

interface OutgoingRequestRowProps {
  connectionId: string;
  user: FriendUser;
  createdAt: string;
}

export function OutgoingRequestRow({
  connectionId,
  user,
  createdAt,
}: OutgoingRequestRowProps) {
  return (
    <li
      key={connectionId}
      className="flex items-center gap-4 rounded-md border bg-surface p-4"
    >
      <UserPic photo={user.photo} name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-ink">{user.name}</div>
        <div className="text-xs text-muted">Sent {formatRelative(createdAt)}</div>
      </div>
      <CancelRequestButton name={user.name} friendId={user.id} />
    </li>
  );
}

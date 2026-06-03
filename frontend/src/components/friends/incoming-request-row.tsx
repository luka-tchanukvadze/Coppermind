"use client";

import { UserPic } from "@/components/shared/user-pic";
import { FriendRequestActions } from "./friend-request-actions";
import { formatRelative } from "@/lib/format";
import type { FriendUser } from "@/lib/api/friends";

interface IncomingRequestRowProps {
  connectionId: string;
  user: FriendUser;
  createdAt: string;
}

export function IncomingRequestRow({
  connectionId,
  user,
  createdAt,
}: IncomingRequestRowProps) {
  return (
    <li
      key={connectionId}
      className="flex flex-wrap items-center gap-3 rounded-md border bg-surface p-4 sm:flex-nowrap sm:gap-4"
    >
      <UserPic photo={user.photo} name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-ink">{user.name}</div>
        <div className="text-xs text-muted">
          Requested {formatRelative(createdAt)}
        </div>
      </div>
      <FriendRequestActions name={user.name} friendId={user.id} />
    </li>
  );
}

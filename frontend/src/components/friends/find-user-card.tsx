"use client";

import { UserPic } from "@/components/shared/user-pic";
import { AddFriendButton } from "./add-friend-button";
import { useMutualFriends } from "@/lib/api/friends";
import { orderFromPhoto } from "@/lib/avatars";
import type { User } from "@/types/schema";

/* TODO N+1 - useMutualFriends fires per Find card.
   needs backend: include mutualCount in /users response, or bulk endpoint */
export function FindUserCard({ user }: { user: User }) {
  const { data: mutuals = [] } = useMutualFriends(user.id);
  const mutual = mutuals.length;
  const order = orderFromPhoto(user.photo);

  return (
    <div className="flex flex-col items-start gap-3 rounded-md border bg-surface p-5">
      <div className="flex w-full items-center gap-3">
        <UserPic photo={user.photo} name={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink">{user.name}</div>
          <div className="truncate text-xs text-muted">
            {mutual > 0
              ? `${mutual} mutual ${mutual === 1 ? "friend" : "friends"}`
              : (order ?? "Reader")}
          </div>
        </div>
      </div>
      <AddFriendButton name={user.name} friendId={user.id} />
    </div>
  );
}

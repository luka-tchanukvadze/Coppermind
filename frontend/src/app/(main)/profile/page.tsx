"use client";

import { useMe } from "@/lib/api/users";
import { useUserBooks } from "@/lib/api/user-books";
import { ProfileView } from "@/components/profile/profile-view";

export default function MyProfilePage() {
  const { data: me, isLoading: meLoading, error: meError } = useMe();
  const { data: shelf, isLoading: shelfLoading } = useUserBooks(1, 200);

  if (meLoading || shelfLoading) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (meError || !me) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load your profile. Try again in a moment.
      </div>
    );
  }

  return <ProfileView user={me} isMe shelf={shelf ?? []} />;
}

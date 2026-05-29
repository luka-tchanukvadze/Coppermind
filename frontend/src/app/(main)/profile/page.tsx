"use client";

import { useMe } from "@/lib/api/users";
import { useUserBooks } from "@/lib/api/user-books";
import { ProfileView } from "@/components/profile/profile-view";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

// 1000 is a generous safety net for any realistic shelf size; the page renders
// a count + the list, so a silent cut would mislead. swap for proper paging
// (e.g. infinite scroll on the shelf tab) once anyone actually hits this
const SHELF_LIMIT = 1000;

export default function MyProfilePage() {
  const { data: me, isLoading: meLoading, error: meError } = useMe();
  const { data: shelf, isLoading: shelfLoading } = useUserBooks(1, SHELF_LIMIT);

  if (meLoading || shelfLoading) return <ProfileSkeleton />;

  if (meError || !me) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load your profile. Try again in a moment.
      </div>
    );
  }

  return <ProfileView user={me} isMe shelf={shelf ?? []} />;
}

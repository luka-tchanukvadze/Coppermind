"use client";

import { useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { useMe, useUser } from "@/lib/api/users";
import { useUserBooksForUser } from "@/lib/api/user-books";
import { ApiError } from "@/lib/api/client";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const { data: me } = useMe();
  const { data: user, isLoading: userLoading, error: userError } = useUser(userId);
  const { data: shelf, isLoading: shelfLoading } = useUserBooksForUser(userId);

  // canonical route for own profile is /profile, not /profile/:id
  const isOwnProfile = !!me && me.id === userId;

  useEffect(() => {
    if (isOwnProfile) router.replace("/profile");
  }, [isOwnProfile, router]);

  if (isOwnProfile) return null;

  if (userLoading || shelfLoading) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (userError instanceof ApiError && userError.status === 404) notFound();

  if (userError || !user) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load this profile. Try again in a moment.
      </div>
    );
  }

  return <ProfileView user={user} isMe={false} shelf={shelf ?? []} />;
}

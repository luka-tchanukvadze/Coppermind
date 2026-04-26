import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { getUser, currentUser } from "@/lib/mocks/dummy";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = getUser(userId);
  if (!user) notFound();
  return <ProfileView user={user} isMe={user.id === currentUser().id} />;
}

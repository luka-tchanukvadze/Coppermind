import { ProfileView } from "@/components/profile/profile-view";
import { currentUser } from "@/lib/mocks/dummy";

export default function MyProfilePage() {
  const me = currentUser();
  return <ProfileView user={me} isMe />;
}

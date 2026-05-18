import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileBanner } from "./profile-banner";
import { ProfileStats } from "./profile-stats";
import { ProfileShelfTab } from "./profile-shelf-tab";
import { ProfileDiscussionsTab } from "./profile-discussions-tab";
import { ProfileNotesTab } from "./profile-notes-tab";
import type { User, UserBookWithBook } from "@/types/schema";

interface ProfileViewProps {
  user: User;
  isMe: boolean;
  shelf: UserBookWithBook[];
}

export function ProfileView({ user, isMe, shelf }: ProfileViewProps) {
  return (
    <>
      <ProfileBanner user={user} isMe={isMe} />

      <ProfileStats
        stats={[
          { value: shelf.length, label: "Books" },
          {
            value: shelf.filter((b) => b.progress === "READING").length,
            label: "Reading",
          },
          { value: 0, label: "Friends" }, // TODO: wire when /friends/:userId exists
          { value: 0, label: "Discussions" }, // TODO: wire when /discussions?creator=X exists
        ]}
      />

      <div className="mt-12">
        <Tabs defaultValue="shelf">
          <TabsList>
            <TabsTrigger value="shelf">Shelf</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="shelf">
            <ProfileShelfTab books={shelf} linkToOwnShelf={isMe} />
          </TabsContent>

          <TabsContent value="discussions">
            <ProfileDiscussionsTab discussions={[]} />
          </TabsContent>

          <TabsContent value="notes">
            <ProfileNotesTab groups={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

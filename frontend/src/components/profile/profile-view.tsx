"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileBanner } from "./profile-banner";
import { ProfileStats } from "./profile-stats";
import { ProfileShelfTab } from "./profile-shelf-tab";
import { ProfileDiscussionsTab } from "./profile-discussions-tab";
import { ProfileNotesTab } from "./profile-notes-tab";
import {
  useUserDiscussions,
  useUserProfileStats,
  useUserPublicNotes,
} from "@/lib/api/users";
import type {
  Book,
  CustomData,
  CustomDataWithBook,
  User,
  UserBookWithBook,
} from "@/types/schema";

interface ProfileViewProps {
  user: User;
  isMe: boolean;
  shelf: UserBookWithBook[];
}

// fold a flat note list into one group per book so the notes tab can render
// "{book header} {notes...}" sections instead of a chronological mush
function groupNotesByBook(
  notes: CustomDataWithBook[],
): { book: Book; notes: CustomData[] }[] {
  const map = new Map<string, { book: Book; notes: CustomData[] }>();
  for (const n of notes) {
    const existing = map.get(n.book.id);
    if (existing) {
      existing.notes.push(n);
    } else {
      map.set(n.book.id, { book: n.book, notes: [n] });
    }
  }
  return Array.from(map.values());
}

export function ProfileView({ user, isMe, shelf }: ProfileViewProps) {
  const { data: stats } = useUserProfileStats(user.id);
  const { data: discussions = [] } = useUserDiscussions(user.id);
  const { data: notes = [] } = useUserPublicNotes(user.id);

  const noteGroups = groupNotesByBook(notes);

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
          { value: stats?.friends ?? 0, label: "Friends" },
          { value: stats?.discussions ?? 0, label: "Discussions" },
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
            <ProfileDiscussionsTab discussions={discussions} />
          </TabsContent>

          <TabsContent value="notes">
            <ProfileNotesTab groups={noteGroups} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

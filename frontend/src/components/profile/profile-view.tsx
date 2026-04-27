import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileBanner } from "./profile-banner";
import { ProfileStats } from "./profile-stats";
import { ProfileShelfTab } from "./profile-shelf-tab";
import { ProfileDiscussionsTab } from "./profile-discussions-tab";
import { ProfileNotesTab } from "./profile-notes-tab";
import {
  userBooksWithBook,
  friendsOf,
  DISCUSSIONS,
  CUSTOM_DATA,
} from "@/lib/mocks/dummy";
import type { User, Book, CustomData } from "@/types/schema";

export function ProfileView({ user, isMe = false }: { user: User; isMe?: boolean }) {
  // Mirror the backend: getPublicUserBooks returns only isPrivate=false books for non-owners.
  const allShelf = userBooksWithBook(user.id);
  const shelf = isMe ? allShelf : allShelf.filter((ub) => !ub.isPrivate);

  const friends = friendsOf(user.id);
  const discussions = DISCUSSIONS.filter((d) => d.creatorId === user.id);
  const publicNotes = CUSTOM_DATA.filter((cd) => cd.userId === user.id && !cd.isPrivate);

  // Group public notes by their book.
  const notesByBook = new Map<string, { book: Book; notes: CustomData[] }>();
  for (const n of publicNotes) {
    const ub = allShelf.find((s) => s.id === n.userBookId);
    if (!ub) continue;
    const existing = notesByBook.get(ub.book.id);
    if (existing) existing.notes.push(n);
    else notesByBook.set(ub.book.id, { book: ub.book, notes: [n] });
  }

  return (
    <>
      <ProfileBanner user={user} isMe={isMe} />

      <ProfileStats
        stats={[
          { value: shelf.length, label: "Books" },
          { value: shelf.filter((b) => b.progress === "READING").length, label: "Reading" },
          { value: friends.length, label: "Friends" },
          { value: discussions.length, label: "Discussions" },
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
            <ProfileNotesTab groups={[...notesByBook.values()]} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { BookCover } from "@/components/shared/book-cover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getBook, USERS, CUSTOM_DATA, DISCUSSIONS, discussionWithCounts } from "@/lib/mocks/dummy";
import { BookActions } from "./_components/book-actions";
import { ReadersTab } from "./_components/readers-tab";
import { PublicNotesTab } from "./_components/public-notes-tab";
import { RelatedDiscussionsTab } from "./_components/related-discussions-tab";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  // Sample 8 users as readers (no real "readers" relation in schema; this is dummy).
  const readers = USERS.slice(0, 8).map((u, i) => ({
    user: u,
    status: ["Reading", "Finished", "Want to read"][i % 3] as string,
  }));

  // Public CustomData entries across all users.
  const publicNotes = CUSTOM_DATA.filter((cd) => !cd.isPrivate).slice(0, 5);

  // Schema doesn't link Discussion to Book yet; show recent threads as related.
  const discussions = DISCUSSIONS.slice(0, 3).map(discussionWithCounts);

  return (
    <div className="grid gap-8 pb-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-10">
      <div className="mx-auto w-full max-w-65 md:mx-0 md:max-w-none">
        <BookCover
          coverImage={book.coverImage}
          title={book.title}
          author={book.author}
          size="xl"
          className="w-full"
        />
        <BookActions />
      </div>

      <div className="min-w-0 pt-2">
        <h1 className="wrap-break-word font-serif text-3xl font-medium leading-[1.1] text-ink sm:text-4xl md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-2 wrap-break-word text-base italic text-muted sm:text-lg">by {book.author}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {book.genres.map((g) => (
            <Badge key={g} variant="outline">
              {g}
            </Badge>
          ))}
        </div>

        <div className="mt-10 border-t pt-10">
          <Tabs defaultValue="readers">
            <TabsList className="flex-wrap">
              <TabsTrigger value="readers">Readers</TabsTrigger>
              <TabsTrigger value="notes">Public notes</TabsTrigger>
              <TabsTrigger value="discussions">Related discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="readers"><ReadersTab readers={readers} /></TabsContent>
            <TabsContent value="notes"><PublicNotesTab notes={publicNotes} /></TabsContent>
            <TabsContent value="discussions"><RelatedDiscussionsTab discussions={discussions} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

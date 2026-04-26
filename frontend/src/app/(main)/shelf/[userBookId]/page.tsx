import { notFound } from "next/navigation";
import { getUserBook, getBook, customDataForUserBook } from "@/lib/mocks/dummy";
import { BackBar } from "./_components/back-bar";
import { UserBookAside } from "./_components/userbook-aside";
import { UserBookEntries } from "./_components/userbook-entries";

export default async function UserBookDetailPage({
  params,
}: {
  params: Promise<{ userBookId: string }>;
}) {
  const { userBookId } = await params;
  const userBook = getUserBook(userBookId);
  if (!userBook) notFound();
  const book = getBook(userBook.bookId);
  const entries = customDataForUserBook(userBook.id);

  return (
    <>
      <BackBar />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <UserBookAside userBook={userBook} book={book} entryCount={entries.length} />
        <UserBookEntries entries={entries} />
      </div>
    </>
  );
}

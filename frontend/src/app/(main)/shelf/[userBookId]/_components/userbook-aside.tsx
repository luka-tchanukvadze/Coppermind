import { BookCover } from "@/components/shared/book-cover";
import { Separator } from "@/components/ui/separator";
import { StatusSelect } from "@/components/shelf/status-select";
import { PrivacySwitch } from "@/components/shelf/privacy-switch";
import { formatShortDate } from "@/lib/format";
import type { Book, UserBook } from "@/types/schema";

interface UserBookAsideProps {
  userBook: UserBook;
  book: Book;
  entryCount: number;
}

export function UserBookAside({ userBook, book, entryCount }: UserBookAsideProps) {
  return (
    <aside className="lg:sticky lg:top-10 lg:self-start">
      <div className="mx-auto max-w-64 lg:mx-0 lg:max-w-none">
        <BookCover
          coverImage={book.coverImage}
          title={book.title}
          author={book.author}
          size="xl"
          className="w-full"
        />
      </div>

      <div className="mt-6 space-y-1">
        <h1 className="font-serif text-2xl font-medium leading-tight text-ink">{book.title}</h1>
        <p className="italic text-muted">by {book.author}</p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-5">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">Status</div>
          <StatusSelect defaultValue={userBook.progress} />
        </div>

        <PrivacySwitch
          defaultValue={userBook.isPrivate}
          label="Private shelf"
          helper="When off, friends can see this book on your shelf."
          idSuffix={userBook.id}
        />

        <dl className="space-y-2 text-xs text-muted">
          <div className="flex justify-between">
            <dt>Added</dt>
            <dd className="text-ink">{formatShortDate(userBook.createdAt)}</dd>
          </div>
          {userBook.progressUpdatedAt && (
            <div className="flex justify-between">
              <dt>Last updated</dt>
              <dd className="text-ink">{formatShortDate(userBook.progressUpdatedAt)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Entries</dt>
            <dd className="text-ink">{entryCount}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

import { Globe2 } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { ProfileEmpty } from "./profile-empty";
import type { Book, CustomData } from "@/types/schema";

interface NotesGroup {
  book: Book;
  notes: CustomData[];
}

export function ProfileNotesTab({ groups }: { groups: NotesGroup[] }) {
  if (groups.length === 0) return <ProfileEmpty label="No public notes yet." />;

  return (
    <div className="space-y-8">
      {groups.map(({ book, notes }) => (
        <section key={book.id}>
          <header className="mb-3 flex items-center gap-3">
            <BookCover coverImage={book.coverImage} title={book.title} size="sm" />
            <div className="min-w-0">
              <h3 className="wrap-break-word font-serif text-lg font-medium text-ink">{book.title}</h3>
              <p className="truncate text-xs italic text-muted">{book.author}</p>
            </div>
          </header>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent">
                  <Globe2 className="h-3 w-3" /> Public
                </div>
                <h4 className="mt-1 wrap-break-word font-serif text-base font-medium text-ink">{n.title}</h4>
                <p className="mt-1 line-clamp-3 wrap-break-word text-sm leading-relaxed text-ink/85">{n.content}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

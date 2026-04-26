import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { BookCover } from "@/components/shared/book-cover";
import { Button } from "@/components/ui/button";
import { recommendedBooks } from "@/lib/mocks/dummy";
import { avatarSrc } from "@/lib/avatars";

export function Recommendations() {
  const recs = recommendedBooks(4);
  if (recs.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
        You might like
      </h2>
      <ul className="space-y-3">
        {recs.map(({ book, reason, friendAvatars }) => (
          <li key={book.id} className="rounded-md border bg-surface p-3">
            <div className="flex gap-3">
              <Link href={`/books/${book.id}`} className="shrink-0">
                <BookCover coverImage={book.coverImage} title={book.title} size="sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/books/${book.id}`} className="block">
                  <h3 className="line-clamp-2 font-serif text-sm font-medium leading-tight text-ink hover:text-accent">
                    {book.title}
                  </h3>
                  <p className="truncate text-xs italic text-muted">{book.author}</p>
                </Link>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                  {friendAvatars.length > 0 && (
                    <div className="flex -space-x-1.5">
                      {friendAvatars.map((photo, i) => (
                        <Image
                          key={i}
                          src={avatarSrc(photo)}
                          alt=""
                          width={18}
                          height={18}
                          unoptimized
                          className="h-4.5 w-4.5 rounded-full border border-surface object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <span className="truncate">{reason}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-center text-xs">
              <Plus className="h-3 w-3" /> Add to shelf
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

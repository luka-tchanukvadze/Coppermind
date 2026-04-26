import Link from "next/link";
import { Heart, MessageCircle, Quote } from "lucide-react";
import { BookCover } from "@/components/shared/book-cover";
import { UserPic } from "@/components/shared/user-pic";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import type { FeedItem } from "@/types/schema";

function verbFor(kind: FeedItem["kind"]): string {
  switch (kind) {
    case "started_reading":
      return "started reading";
    case "finished_book":
      return "finished";
    case "wants_to_read":
      return "wants to read";
    case "new_discussion":
      return "started a discussion";
    case "discussion_comment":
      return "replied to";
    case "public_note":
      return "shared a public note on";
  }
}

export function FeedCard({ item }: { item: FeedItem }) {
  const verb = verbFor(item.kind);

  return (
    <article className="rounded-md border bg-surface p-6 transition-colors hover:border-border-strong">
      <header className="flex items-start gap-3">
        <UserPic photo={item.user.photo} name={item.user.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 wrap-break-word text-sm text-ink">
            <Link href={`/profile/${item.user.id}`} className="font-medium hover:text-accent">
              {item.user.name}
            </Link>
            <span className="text-muted">{verb}</span>
            {item.book && (
              <Link href={`/books/${item.book.id}`} className="font-serif font-medium text-ink hover:text-accent">
                {item.book.title}
              </Link>
            )}
            {item.book?.author && <span className="italic text-muted">by {item.book.author}</span>}
            {item.discussion && (
              <Link href={`/discussions/${item.discussion.id}`} className="font-serif font-medium text-ink hover:text-accent">
                &ldquo;{item.discussion.title}&rdquo;
              </Link>
            )}
          </div>
          <div className="mt-0.5 text-xs text-muted">{formatRelative(item.createdAt)}</div>
        </div>
      </header>

      {item.book && (item.kind === "started_reading" || item.kind === "finished_book" || item.kind === "wants_to_read") && (
        <div className="mt-4 flex gap-4">
          <Link href={`/books/${item.book.id}`}>
            <BookCover coverImage={item.book.coverImage} title={item.book.title} size="md" showTitle />
          </Link>
          <div className="flex flex-1 flex-col justify-center text-sm text-muted">
            <Badge variant="muted" className="self-start">
              {item.kind === "started_reading" ? "Reading" : item.kind === "finished_book" ? "Finished" : "Want to read"}
            </Badge>
          </div>
        </div>
      )}

      {item.kind === "new_discussion" && item.discussion && (
        <div className="mt-4 rounded-md border border-dashed bg-muted-bg/40 p-4">
          <p className="line-clamp-2 text-sm text-ink">{item.discussion.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {item.discussion.commentCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {item.discussion.likeCount ?? 0}
            </span>
          </div>
        </div>
      )}

      {item.kind === "discussion_comment" && item.commentExcerpt && (
        <blockquote className="mt-4 border-l-2 border-accent/40 pl-4 font-serif text-[15px] italic leading-relaxed text-ink/85">
          &ldquo;{item.commentExcerpt}&rdquo;
        </blockquote>
      )}

      {item.kind === "public_note" && item.note && (
        <div className="mt-4 flex gap-4">
          {item.book && <BookCover coverImage={item.book.coverImage} title={item.book.title} size="md" />}
          <div className="min-w-0 flex-1">
            <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted">
              <Quote className="h-3 w-3" /> Public note
            </div>
            <h3 className="wrap-break-word font-serif text-lg font-medium leading-tight text-ink">
              {item.note.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 wrap-break-word text-sm leading-relaxed text-ink/80">{item.note.content}</p>
          </div>
        </div>
      )}
    </article>
  );
}

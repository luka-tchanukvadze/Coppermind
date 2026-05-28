import Link from "next/link";
import { MessageCircle, Heart, BookOpen } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { formatRelative } from "@/lib/format";
import type { DiscussionWithCounts } from "@/types/schema";

export function DiscussionCard({ discussion }: { discussion: DiscussionWithCounts }) {
  const d = discussion;
  return (
    <Link href={`/discussions/${d.id}`} className="group block py-5 transition-colors">
      <h3 className="wrap-break-word font-serif text-xl font-medium leading-tight text-accent group-hover:underline">
        {d.title}
      </h3>
      {d.book && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">
            About <span className="font-medium text-ink">{d.book.title}</span>
            <span className="italic"> by {d.book.author}</span>
          </span>
        </div>
      )}
      <p className="mt-1.5 line-clamp-2 wrap-break-word text-sm leading-relaxed text-ink/80">
        {d.description}
      </p>
      <footer className="mt-3 flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <UserPic photo={d.creator.photo} name={d.creator.name} size="xs" />
          <span>{d.creator.name}</span>
        </div>
        <span>·</span>
        <span>{formatRelative(d.createdAt)}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> {d.commentCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {d.likeCount}
          </span>
        </span>
      </footer>
    </Link>
  );
}

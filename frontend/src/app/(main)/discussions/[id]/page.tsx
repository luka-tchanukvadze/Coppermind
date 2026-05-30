"use client";

import { useRef } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Share2 } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { BookCover } from "@/components/shared/book-cover";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/discussions/like-button";
import { DiscussionActionsMenu } from "@/components/discussions/discussion-actions-menu";
import { ReplyComposer } from "@/components/discussions/reply-composer";
import { useDiscussion } from "@/lib/api/discussions";
import { useMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { formatRelative } from "@/lib/format";

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: d, isLoading, error } = useDiscussion(id);
  const { data: me } = useMe();
  const replyRef = useRef<HTMLTextAreaElement>(null);

  // jump to the reply box and focus it - used by the "X replies" button
  const focusReply = () => {
    replyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    replyRef.current?.focus({ preventScroll: true });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) notFound();
  if (error || !d) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load this discussion.
      </div>
    );
  }

  const comments = d.comments;
  const commentCount = comments.length;
  const isOwnDiscussion = d.creatorId === me?.id;
  const isAdmin = me?.role === "admin";

  // native share sheet on mobile, copy-link fallback elsewhere. swallow the
  // reject navigator.share throws when the user dismisses the sheet
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: d.title, url });
      } catch {
        // user cancelled - nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Share it with a friend.");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/discussions">
            <ArrowLeft className="h-4 w-4" /> All discussions
          </Link>
        </Button>
      </div>

      <article className="mx-auto max-w-3xl">
        <header className="pb-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 wrap-break-word font-serif text-3xl font-medium leading-[1.1] text-ink sm:text-4xl md:text-5xl">
              {d.title}
            </h1>
            {(isOwnDiscussion || isAdmin) && (
              <DiscussionActionsMenu
                discussionId={d.id}
                title={d.title}
                description={d.description}
                asAdmin={!isOwnDiscussion}
              />
            )}
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted">
            <UserPic photo={d.creator.photo} name={d.creator.name} size="sm" />
            <div>
              <div className="text-ink">{d.creator.name}</div>
              <div className="text-xs">{formatRelative(d.createdAt)}</div>
            </div>
          </div>

          {d.book && (
            <Link
              href={`/books/${d.book.id}`}
              className="mt-6 flex items-center gap-3 rounded-md border bg-surface p-3 transition-colors hover:border-border-strong"
            >
              <BookCover
                coverImage={d.book.coverImage}
                title={d.book.title}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-widest text-muted">
                  About this book
                </div>
                <div className="mt-0.5 truncate font-serif text-base font-medium text-ink">
                  {d.book.title}
                </div>
                <div className="truncate text-xs italic text-muted">
                  {d.book.author}
                </div>
              </div>
            </Link>
          )}
        </header>

        <div className="space-y-4 wrap-break-word text-[16px] leading-relaxed text-ink/90 sm:text-[17px]">
          {d.description.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-center gap-2 border-y py-3">
          <LikeButton
            discussionId={d.id}
            initialCount={d.likeCount}
            initialLiked={d.likedByMe}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={focusReply}
          >
            <MessageCircle className="h-4 w-4" /> {commentCount} replies
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </footer>

        <section className="mt-12">
          <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
            {commentCount} {commentCount === 1 ? "reply" : "replies"}
          </h2>

          <ul className="space-y-6">
            {comments.map((c) => {
              const isOwnComment = c.userId === me?.id;
              return (
                <li key={c.id} className="flex gap-3">
                  <UserPic
                    photo={c.user.photo}
                    name={c.user.name}
                    size="sm"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1 rounded-md border bg-surface p-4">
                    <header className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">
                          {c.user.name}
                        </span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">
                          {formatRelative(c.createdAt)}
                        </span>
                      </div>
                      {(isOwnComment || isAdmin) && (
                        <DiscussionActionsMenu
                          kind="comment"
                          discussionId={d.id}
                          commentId={c.id}
                          asAdmin={!isOwnComment}
                        />
                      )}
                    </header>
                    <p className="wrap-break-word text-sm leading-relaxed text-ink/90">
                      {c.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-10">
            <ReplyComposer discussionId={d.id} textareaRef={replyRef} />
          </div>
        </section>
      </article>
    </>
  );
}

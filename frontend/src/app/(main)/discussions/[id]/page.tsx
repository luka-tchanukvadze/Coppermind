import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Share2 } from "lucide-react";
import { UserPic } from "@/components/shared/user-pic";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/discussions/like-button";
import { DiscussionActionsMenu } from "@/components/discussions/discussion-actions-menu";
import { ReplyComposer } from "@/components/discussions/reply-composer";
import { getDiscussion, discussionWithCounts, commentsFor, currentUser } from "@/lib/mocks/dummy";
import { formatRelative } from "@/lib/format";

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDiscussion(id);
  if (!d) notFound();
  const dwc = discussionWithCounts(d);
  const comments = commentsFor(d.id);
  const me = currentUser();
  const isOwnDiscussion = d.creatorId === me.id;

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
            {isOwnDiscussion && (
              <DiscussionActionsMenu title={d.title} description={d.description} />
            )}
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted">
            <UserPic photo={dwc.creator.photo} name={dwc.creator.name} size="sm" />
            <div>
              <div className="text-ink">{dwc.creator.name}</div>
              <div className="text-xs">{formatRelative(d.createdAt)}</div>
            </div>
          </div>
        </header>

        <div className="space-y-4 wrap-break-word text-[16px] leading-relaxed text-ink/90 sm:text-[17px]">
          {d.description.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-center gap-2 border-y py-3">
          <LikeButton initialCount={dwc.likeCount} />
          <Button variant="ghost" size="sm" className="gap-1.5">
            <MessageCircle className="h-4 w-4" /> {dwc.commentCount} replies
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto gap-1.5">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </footer>

        <section className="mt-12">
          <h2 className="mb-6 font-serif text-2xl font-medium text-ink">
            {dwc.commentCount} {dwc.commentCount === 1 ? "reply" : "replies"}
          </h2>

          <ul className="space-y-6">
            {comments.map((c) => {
              const isOwnComment = c.userId === me.id;
              return (
                <li key={c.id} className="flex gap-3">
                  <UserPic photo={c.user.photo} name={c.user.name} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1 rounded-md border bg-surface p-4">
                    <header className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{c.user.name}</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{formatRelative(c.createdAt)}</span>
                      </div>
                      {isOwnComment && <DiscussionActionsMenu kind="comment" />}
                    </header>
                    <p className="wrap-break-word text-sm leading-relaxed text-ink/90">{c.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-10">
            <ReplyComposer />
          </div>
        </section>
      </article>
    </>
  );
}

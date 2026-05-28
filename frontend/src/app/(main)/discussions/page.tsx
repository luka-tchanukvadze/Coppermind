"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { UserPic } from "@/components/shared/user-pic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NewDiscussionDialog } from "@/components/discussions/new-discussion-dialog";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import {
  DiscussionListSkeleton,
  ActiveReadersSkeleton,
} from "@/components/discussions/discussions-skeleton";
import { useDiscussions } from "@/lib/api/discussions";
import type { DiscussionWithCounts } from "@/types/schema";

export default function DiscussionsPage() {
  const { data: all = [], isLoading, error } = useDiscussions();
  const byNew = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const byLikes = [...all].sort((a, b) => b.likeCount - a.likeCount);
  const byComments = [...all].sort((a, b) => b.commentCount - a.commentCount);

  // dedupe by creator id - same person posting 6 threads shouldn't fill all 6 slots
  const activeReaders = Array.from(
    new Map(all.map((d) => [d.creator.id, d.creator])).values(),
  ).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Discussions"
        subtitle="What people are actually talking about."
        actions={<NewDiscussionDialog />}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">Newest</TabsTrigger>
              <TabsTrigger value="liked">Most liked</TabsTrigger>
              <TabsTrigger value="commented">Most commented</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <DiscussionList items={byNew} isLoading={isLoading} error={!!error} />
            </TabsContent>
            <TabsContent value="liked">
              <DiscussionList items={byLikes} isLoading={isLoading} error={!!error} />
            </TabsContent>
            <TabsContent value="commented">
              <DiscussionList items={byComments} isLoading={isLoading} error={!!error} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="order-first lg:order-last">
          <section className="rounded-md border bg-surface p-5 lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
              Active readers
            </h2>
            {isLoading ? (
              <ActiveReadersSkeleton />
            ) : (
              <>
                <div className="flex items-center">
                  {activeReaders.map((reader, i) => (
                    <Tooltip key={reader.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/profile/${reader.id}`}
                          aria-label={reader.name}
                          className={
                            i === 0
                              ? "rounded-full ring-offset-2 transition-transform hover:z-10 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                              : "-ml-2 rounded-full ring-offset-2 transition-transform hover:z-10 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          }
                        >
                          <UserPic
                            photo={reader.photo}
                            name={reader.name}
                            size="sm"
                            className="border-2 border-background"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{reader.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">
                  {all.length} active threads.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

function DiscussionList({
  items,
  isLoading,
  error,
}: {
  items: DiscussionWithCounts[];
  isLoading: boolean;
  error: boolean;
}) {
  if (isLoading) return <DiscussionListSkeleton />;

  if (error) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        Could not load discussions. Try again in a moment.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        No discussions yet. Start the conversation and see who joins in.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((d) => (
        <li key={d.id}>
          <DiscussionCard discussion={d} />
        </li>
      ))}
    </ul>
  );
}

"use client";

import { PageHeader } from "@/components/shared/page-header";
import { UserPic } from "@/components/shared/user-pic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewDiscussionDialog } from "@/components/discussions/new-discussion-dialog";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import { useDiscussions } from "@/lib/api/discussions";
import type { DiscussionWithCounts } from "@/types/schema";

export default function DiscussionsPage() {
  const { data: all = [], isLoading, error } = useDiscussions();
  const byNew = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const byLikes = [...all].sort((a, b) => b.likeCount - a.likeCount);
  const byComments = [...all].sort((a, b) => b.commentCount - a.commentCount);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load discussions. Try again in a moment.
      </div>
    );
  }

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

            <TabsContent value="new"><DiscussionList items={byNew} /></TabsContent>
            <TabsContent value="liked"><DiscussionList items={byLikes} /></TabsContent>
            <TabsContent value="commented"><DiscussionList items={byComments} /></TabsContent>
          </Tabs>
        </div>

        <aside className="order-first lg:order-last">
          <section className="rounded-md border bg-surface p-5 lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
              Active readers
            </h2>
            <div className="flex items-center">
              {all.slice(0, 6).map((d, i) => (
                <UserPic
                  key={d.id}
                  photo={d.creator.photo}
                  name={d.creator.name}
                  size="sm"
                  className={i === 0 ? "border-2 border-background" : "-ml-2 border-2 border-background"}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              {all.length} active threads this week.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function DiscussionList({ items }: { items: DiscussionWithCounts[] }) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        No discussions yet. Start one.
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

import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { UserPic } from "@/components/shared/user-pic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewDiscussionDialog } from "@/components/discussions/new-discussion-dialog";
import { allDiscussions } from "@/lib/mocks/dummy";
import { formatRelative } from "@/lib/format";

export default function DiscussionsPage() {
  const all = allDiscussions();
  const byNew = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const byLikes = [...all].sort((a, b) => b.likeCount - a.likeCount);
  const byComments = [...all].sort((a, b) => b.commentCount - a.commentCount);

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

            <TabsContent value="new"><List items={byNew} /></TabsContent>
            <TabsContent value="liked"><List items={byLikes} /></TabsContent>
            <TabsContent value="commented"><List items={byComments} /></TabsContent>
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

function List({ items }: { items: ReturnType<typeof allDiscussions> }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((d) => (
        <li key={d.id}>
          <Link href={`/discussions/${d.id}`} className="group block py-5 transition-colors">
            <h3 className="wrap-break-word font-serif text-xl font-medium leading-tight text-accent group-hover:underline">
              {d.title}
            </h3>
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
        </li>
      ))}
    </ul>
  );
}

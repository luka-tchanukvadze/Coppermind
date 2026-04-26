import { PageHeader } from "@/components/shared/page-header";
import { FeedCard } from "@/components/feed/feed-card";
import { ContinueReading } from "@/components/feed/continue-reading";
import { Recommendations } from "@/components/feed/recommendations";
import { UserPic } from "@/components/shared/user-pic";
import { FEED_ITEMS, friendsOf, currentUser } from "@/lib/mocks/dummy";

export default function FeedPage() {
  const feed = FEED_ITEMS;
  const friends = friendsOf().slice(0, 4);
  const me = currentUser();

  return (
    <>
      <PageHeader
        title={`Welcome back, ${me.name.split(" ")[0]}.`}
        subtitle="Your library, your friends, what they're reading today."
      />

      <ContinueReading />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <h2 className="mb-4 font-serif text-xl font-medium text-ink">Around your library</h2>
          <div className="space-y-4">
            {feed.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <Recommendations />

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
              Friends reading now
            </h2>
            <ul className="space-y-2.5">
              {friends.map((friend, i) => {
                const sampleBooks = ["Piranesi", "Babel", "Sea of Tranquility", "The Bee Sting"];
                return (
                  <li key={friend.id} className="flex items-center gap-3 text-sm">
                    <UserPic photo={friend.photo} name={friend.name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-ink">{friend.name}</div>
                      <div className="truncate text-xs italic text-muted">{sampleBooks[i]}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

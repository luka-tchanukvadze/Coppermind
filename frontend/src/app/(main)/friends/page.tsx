import Link from "next/link";
import { Search, MessageCircle, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { UserPic } from "@/components/shared/user-pic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FriendCardMenu } from "@/components/friends/friend-card-menu";
import { AddFriendButton } from "@/components/friends/add-friend-button";
import { FriendRequestActions } from "@/components/friends/friend-request-actions";
import { CancelRequestButton } from "@/components/friends/cancel-request-button";
import {
  friendsOf,
  pendingIncoming,
  pendingOutgoing,
  USERS,
  USER_BOOKS,
  currentUser,
  getBook,
  mutualFriendsCount,
} from "@/lib/mocks/dummy";
import { formatRelative } from "@/lib/format";
import type { User } from "@/types/schema";

export default function FriendsPage() {
  const friends = friendsOf();
  const incoming = pendingIncoming();
  const outgoing = pendingOutgoing();
  const me = currentUser();
  const suggested = USERS.filter((u) => u.id !== me.id && !friends.some((f) => f.id === u.id)).slice(0, 6);

  return (
    <>
      <PageHeader title="Friends" subtitle="The people you read with." />

      <Tabs defaultValue="friends">
        <TabsList className="flex-wrap">
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({incoming.length + outgoing.length})</TabsTrigger>
          <TabsTrigger value="find">Find people</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-10">
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
                Incoming ({incoming.length})
              </h2>
              {incoming.length === 0 ? (
                <p className="text-sm text-muted">No pending requests.</p>
              ) : (
                <ul className="space-y-2">
                  {incoming.map(({ connection, user }) => (
                    <li key={connection.id} className="flex flex-wrap items-center gap-3 rounded-md border bg-surface p-4 sm:flex-nowrap sm:gap-4">
                      <UserPic photo={user.photo} name={user.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-ink">{user.name}</div>
                        <div className="text-xs text-muted">Requested {formatRelative(connection.createdAt)}</div>
                      </div>
                      <FriendRequestActions name={user.name} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
                Sent ({outgoing.length})
              </h2>
              {outgoing.length === 0 ? (
                <p className="text-sm text-muted">No pending sends.</p>
              ) : (
                <ul className="space-y-2">
                  {outgoing.map(({ connection, user }) => (
                    <li key={connection.id} className="flex items-center gap-4 rounded-md border bg-surface p-4">
                      <UserPic photo={user.photo} name={user.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-ink">{user.name}</div>
                        <div className="text-xs text-muted">Sent {formatRelative(connection.createdAt)}</div>
                      </div>
                      <CancelRequestButton name={user.name} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="find">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="max-w-md pl-9" placeholder="Search by name or email..." />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggested.map((user) => {
              const mutual = mutualFriendsCount(user.id);
              return (
                <div key={user.id} className="flex flex-col items-start gap-3 rounded-md border bg-surface p-5">
                  <div className="flex w-full items-center gap-3">
                    <UserPic photo={user.photo} name={user.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">{user.name}</div>
                      <div className="truncate text-xs text-muted">
                        {mutual > 0 ? `${mutual} mutual ${mutual === 1 ? "friend" : "friends"}` : user.email}
                      </div>
                    </div>
                  </div>
                  <AddFriendButton name={user.name} />
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function FriendCard({ friend }: { friend: User }) {
  const currentRead = USER_BOOKS.find((ub) => ub.userId === friend.id && ub.progress === "READING");
  const book = currentRead ? getBook(currentRead.bookId) : null;
  const bookCount = USER_BOOKS.filter((ub) => ub.userId === friend.id).length;

  return (
    <article className="flex flex-col gap-4 rounded-md border bg-surface p-5">
      <div className="flex items-start gap-3">
        <UserPic photo={friend.photo} name={friend.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${friend.id}`}
            className="block truncate font-serif text-lg font-medium text-ink hover:text-accent"
          >
            {friend.name}
          </Link>
          {book ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <BookOpen className="h-3 w-3" />
              <span className="truncate italic">Reading {book.title}</span>
            </div>
          ) : (
            <div className="mt-0.5 text-xs text-muted">No active read</div>
          )}
          <div className="mt-1 text-xs text-muted">{bookCount} books on shelf</div>
        </div>
        <FriendCardMenu friendName={friend.name} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" asChild className="flex-1">
          <Link href="/chat">
            <MessageCircle className="h-3.5 w-3.5" /> Message
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="flex-1">
          <Link href={`/profile/${friend.id}`}>View shelf</Link>
        </Button>
      </div>
    </article>
  );
}

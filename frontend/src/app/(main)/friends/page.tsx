"use client";

import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FriendCard } from "@/components/friends/friend-card";
import { FindUserCard } from "@/components/friends/find-user-card";
import { IncomingRequestRow } from "@/components/friends/incoming-request-row";
import { OutgoingRequestRow } from "@/components/friends/outgoing-request-row";
import {
  useFriends,
  useIncomingRequests,
  useOutgoingRequests,
  type FriendUser,
} from "@/lib/api/friends";
import { useMe, useAllUsers } from "@/lib/api/users";

export default function FriendsPage() {
  const { data: me, isLoading: meLoading, error: meError } = useMe();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: incoming = [], isLoading: incomingLoading } = useIncomingRequests();
  const { data: outgoing = [], isLoading: outgoingLoading } = useOutgoingRequests();
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();

  const loading =
    meLoading || friendsLoading || incomingLoading || outgoingLoading || usersLoading;

  if (loading) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (meError || !me) {
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        Could not load friends. Try again in a moment.
      </div>
    );
  }

  // accepted connections include both sides - pick the one that isn't me
  const friendUsers: FriendUser[] = friends
    .map((c) => (c.requester?.id !== me.id ? c.requester : c.addressee))
    .filter((u): u is FriendUser => !!u);

  // Find tab: drop self, existing friends, pending either direction
  const friendIdSet = new Set(friendUsers.map((u) => u.id));
  const incomingIdSet = new Set(incoming.map((c) => c.requester?.id));
  const outgoingIdSet = new Set(outgoing.map((c) => c.addressee?.id));
  const candidates = allUsers.filter(
    (u) =>
      u.id !== me.id &&
      !friendIdSet.has(u.id) &&
      !incomingIdSet.has(u.id) &&
      !outgoingIdSet.has(u.id),
  );

  return (
    <>
      <PageHeader title="Friends" subtitle="The people you read with." />

      <Tabs defaultValue="friends">
        <TabsList className="flex-wrap">
          <TabsTrigger value="friends">Friends ({friendUsers.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({incoming.length + outgoing.length})
          </TabsTrigger>
          <TabsTrigger value="find">Find people</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          {friendUsers.length === 0 ? (
            <p className="text-sm text-muted">No friends yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {friendUsers.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
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
                  {incoming.map((c) => (
                    <IncomingRequestRow
                      key={c.id}
                      connectionId={c.id}
                      user={c.requester!}
                      createdAt={c.createdAt}
                    />
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
                  {outgoing.map((c) => (
                    <OutgoingRequestRow
                      key={c.id}
                      connectionId={c.id}
                      user={c.addressee!}
                      createdAt={c.createdAt}
                    />
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
            {/* TODO wire as controlled value, client-side name/email filter on candidates.
                later: GET /users?q= for server-side search + pagination */}
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted">No more people to add right now.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((user) => (
                <FindUserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}


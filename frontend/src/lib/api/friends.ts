import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export type FriendUser = { id: string; name: string; photo: string };
type FriendConnection = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  requester?: FriendUser; // present on /friends and /requests
  addressee?: FriendUser; // present on /friends and /sent
};

type FriendListResponse = { data: { result: FriendConnection[] } };
// incoming-requests response also carries unseenCount (requests newer than my
// last Friends-page visit) for the nav badge
type IncomingRequestsResponse = FriendListResponse & { unseenCount: number };
type MutualFriendsResponse = { data: { mutualFriends: FriendUser[] } };

async function fetchFriends(): Promise<FriendConnection[]> {
  const res = await apiClient.get<FriendListResponse>("/friends");
  return res.data.result;
}

type IncomingRequests = { result: FriendConnection[]; unseenCount: number };

async function fetchIncomingRequests(): Promise<IncomingRequests> {
  const res =
    await apiClient.get<IncomingRequestsResponse>("/friends/requests");
  return { result: res.data.result, unseenCount: res.unseenCount };
}

async function markRequestsSeenRequest() {
  return apiClient.patch("/friends/requests/seen");
}

async function fetchOutgoingRequests(): Promise<FriendConnection[]> {
  const res = await apiClient.get<FriendListResponse>("/friends/sent");
  return res.data.result;
}

async function fetchMutualFriends(friendId: string): Promise<FriendUser[]> {
  const res = await apiClient.get<MutualFriendsResponse>(
    `/friends/mutual/${friendId}`,
  );
  return res.data.mutualFriends;
}

async function sendFriendRequest(friendId: string) {
  return apiClient.post(`/friends/${friendId}`);
}

async function acceptFriendRequest(friendId: string) {
  return apiClient.patch(`/friends/${friendId}/accept`);
}

async function removeFriend(friendId: string) {
  return apiClient.delete(`/friends/${friendId}`);
}

function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => fetchFriends(),
  });
}

// the page consumes the request list (select unwraps .result so existing
// callers stay unchanged). the badge consumes unseenCount via the hook below.
// kept fresh by the socket friendRequest event (useFriendRequestSubscription)
function useIncomingRequests() {
  return useQuery({
    queryKey: ["friends-incoming"],
    queryFn: () => fetchIncomingRequests(),
    select: (data) => data.result,
  });
}

// unseen incoming-request count for the nav badge. shares the same cached
// query as useIncomingRequests (no extra fetch) - just selects a different slice
function useUnseenRequestCount(): number {
  const { data } = useQuery({
    queryKey: ["friends-incoming"],
    queryFn: () => fetchIncomingRequests(),
    select: (d) => d.unseenCount,
  });
  return data ?? 0;
}

// call when the Friends page opens - stamps "seen" server-side and zeroes the
// badge locally so it clears instantly
function useMarkRequestsSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markRequestsSeenRequest,
    onSuccess: () => {
      queryClient.setQueryData<IncomingRequests>(["friends-incoming"], (old) =>
        old ? { ...old, unseenCount: 0 } : old,
      );
    },
  });
}

function useOutgoingRequests() {
  return useQuery({
    queryKey: ["friends-outgoing"],
    queryFn: () => fetchOutgoingRequests(),
  });
}

function useMutualFriends(friendId: string) {
  return useQuery({
    queryKey: ["friends-mutual", friendId],
    queryFn: () => fetchMutualFriends(friendId),
    enabled: !!friendId,
  });
}

function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-incoming"] });
      queryClient.invalidateQueries({ queryKey: ["friends-outgoing"] });
    },
  });
}

// accept/remove ripple way past the friends list - profile counters change
// for both sides, mutual-friend counts shift across the whole graph, the feed
// gains or loses this user's activities, and rec tiers see the new friend
// signal. invalidate by prefix so all userIds (me + them + everyone they
// share mutuals with) get refetched
function invalidateAfterFriendshipChange(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["friends"] });
  queryClient.invalidateQueries({ queryKey: ["friends-incoming"] });
  queryClient.invalidateQueries({ queryKey: ["friends-outgoing"] });
  queryClient.invalidateQueries({ queryKey: ["friends-mutual"] });
  queryClient.invalidateQueries({ queryKey: ["user-profile-stats"] });
  queryClient.invalidateQueries({ queryKey: ["feed"] });
  queryClient.invalidateQueries({ queryKey: ["recommendations"] });
  // an open chat thread carries an isFriend flag that gates its composer -
  // refetch so unfriending (or re-adding) flips it to/from read-only without
  // needing a manual reload
  queryClient.invalidateQueries({ queryKey: ["conversation"] });
}

function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => invalidateAfterFriendshipChange(queryClient),
  });
}

function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => invalidateAfterFriendshipChange(queryClient),
  });
}

export {
  useFriends,
  useIncomingRequests,
  useUnseenRequestCount,
  useMarkRequestsSeen,
  useOutgoingRequests,
  useMutualFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRemoveFriend,
};

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
type MutualFriendsResponse = { data: { mutualFriends: FriendUser[] } };

async function fetchFriends(): Promise<FriendConnection[]> {
  const res = await apiClient.get<FriendListResponse>("/friends");
  return res.data.result;
}

async function fetchIncomingRequests(): Promise<FriendConnection[]> {
  const res = await apiClient.get<FriendListResponse>("/friends/requests");
  return res.data.result;
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

function useIncomingRequests() {
  return useQuery({
    queryKey: ["friends-incoming"],
    queryFn: () => fetchIncomingRequests(),
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
  useOutgoingRequests,
  useMutualFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRemoveFriend,
};

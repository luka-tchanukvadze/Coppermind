// listFriends, sendRequest, acceptRequest, rejectRequest, cancelRequest, removeFriend
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

type FriendUser = { id: string; name: string; photo: string | null };
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

export {
  useFriends,
  useIncomingRequests,
  useOutgoingRequests,
  useMutualFriends,
  useSendFriendRequest,
};

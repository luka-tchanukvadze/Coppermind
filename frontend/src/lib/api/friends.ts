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

async function fetchFriends(): Promise<FriendConnection[]> {
  const res = await apiClient.get<FriendListResponse>("/friends");
  return res.data.result;
}

function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => fetchFriends(),
  });
}
export { useFriends };

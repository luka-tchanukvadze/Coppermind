// getMe, getUser, updateProfile, updatePassword, deleteAccount
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  CustomDataWithBook,
  DiscussionWithCounts,
  User,
  UserProfileStats,
} from "@/types/schema";

type MeResponse = { status: string; data: { user: User } };

type UpdateMeInput = {
  name?: string;
  email?: string;
  photo?: string;
};

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

type UserResponse = { data: { user: User } };

type AllUsersResponse = { data: { users: User[] } };

async function fetchMe(): Promise<User> {
  const res = await apiClient.get<MeResponse>("/users/me");
  return res.data.user;
}

async function updateMeRequest(input: UpdateMeInput) {
  return apiClient.patch("/users/updateMe", input);
}

async function updatePasswordRequest(input: UpdatePasswordInput) {
  return apiClient.patch("/users/updateMyPassword", input);
}

async function deleteMeRequest() {
  return apiClient.delete("/users/deleteMe");
}

async function fetchUser(id: string): Promise<User> {
  const res = await apiClient.get<UserResponse>(`/users/${id}`);
  return res.data.user;
}

function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
}

// TODO: swap for GET /users?q=<search> + useSearchUsers(q) debounced
//  needs backend: name/email ILIKE filter, limit ~20, pagination
async function fetchAllUsers(): Promise<User[]> {
  const res = await apiClient.get<AllUsersResponse>("/users");
  return res.data.users;
}

function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMeRequest,
    onSuccess: () => {
      // sidebar avatar + name show up via useMe - invalidate to refresh everywhere
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

function useUpdatePassword() {
  return useMutation({ mutationFn: updatePasswordRequest });
  // no cache invalidation needed - JWT refresh happens server-side via createSendToken
}

function useDeleteMe() {
  return useMutation({ mutationFn: deleteMeRequest });
}

function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

function useAllUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetchAllUsers(),
  });
}

// profile-scoped fetches - drive the header counters + the discussions/notes tabs

type ProfileStatsResponse = { data: { stats: UserProfileStats } };
// raw row shape from backend - counts come nested
type UserDiscussionRow = Omit<DiscussionWithCounts, "commentCount" | "likeCount"> & {
  _count: { likes: number; comments: number };
};
type UserDiscussionsApiResponse = { data: { discussions: UserDiscussionRow[] } };
type UserNotesResponse = { data: { notes: CustomDataWithBook[] } };

async function fetchUserProfileStats(id: string): Promise<UserProfileStats> {
  const res = await apiClient.get<ProfileStatsResponse>(
    `/users/${id}/profile-stats`,
  );
  return res.data.stats;
}

async function fetchUserDiscussions(
  id: string,
): Promise<DiscussionWithCounts[]> {
  const res = await apiClient.get<UserDiscussionsApiResponse>(
    `/users/${id}/discussions`,
  );
  // flatten _count to the commentCount/likeCount the UI types expect
  return res.data.discussions.map((d) => ({
    ...d,
    commentCount: d._count.comments,
    likeCount: d._count.likes,
  }));
}

async function fetchUserPublicNotes(
  id: string,
): Promise<CustomDataWithBook[]> {
  const res = await apiClient.get<UserNotesResponse>(`/users/${id}/notes`);
  return res.data.notes;
}

function useUserProfileStats(id: string) {
  return useQuery({
    queryKey: ["user-profile-stats", id],
    queryFn: () => fetchUserProfileStats(id),
    enabled: !!id,
  });
}

function useUserDiscussions(id: string) {
  return useQuery({
    queryKey: ["user-discussions", id],
    queryFn: () => fetchUserDiscussions(id),
    enabled: !!id,
  });
}

function useUserPublicNotes(id: string) {
  return useQuery({
    queryKey: ["user-notes", id],
    queryFn: () => fetchUserPublicNotes(id),
    enabled: !!id,
  });
}

export {
  useMe,
  useUpdateMe,
  useUpdatePassword,
  useDeleteMe,
  useUser,
  useAllUsers,
  useUserProfileStats,
  useUserDiscussions,
  useUserPublicNotes,
};

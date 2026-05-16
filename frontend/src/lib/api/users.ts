// getMe, getUser, updateProfile, updatePassword, deleteAccount
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { User } from "@/types/schema";

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

function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
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

export { useMe, useUpdateMe, useUpdatePassword, useDeleteMe };

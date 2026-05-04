// getMe, getUser, updateProfile, updatePassword, deleteAccount
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { User } from "@/types/schema";

type MeResponse = { status: string; data: { user: User } };

async function fetchMe(): Promise<User> {
  const res = await apiClient.get<MeResponse>("/users/me");
  return res.data.user;
}

function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
}

export { useMe };

// listDiscussions, getDiscussion, create/update/delete, toggleLike
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  Discussion,
  DiscussionWithCounts,
  CommentWithUser,
  User,
} from "@/types/schema";

type Creator = Pick<User, "id" | "name" | "photo">;

// raw backend shapes (counts come nested under _count)
type DiscussionListApi = Discussion & {
  creator: Creator;
  _count: { likes: number; comments: number };
};
type DiscussionDetailApi = Discussion & {
  creator: Creator;
  comments: CommentWithUser[];
  _count: { likes: number };
  likedByMe: boolean;
};

type DiscussionsResponse = { data: { discussions: DiscussionListApi[] } };
type DiscussionResponse = { data: { discussion: DiscussionDetailApi } };

// detail view model: flat likeCount + embedded comments + likedByMe for the heart state
export type DiscussionDetail = Discussion & {
  creator: Creator;
  comments: CommentWithUser[];
  likeCount: number;
  likedByMe: boolean;
};

type CreateDiscussionInput = { title: string; description: string };
type UpdateDiscussionInput = { id: string; title: string; description: string };

// flatten _count -> the commentCount/likeCount the UI types expect
function toListItem(d: DiscussionListApi): DiscussionWithCounts {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    creatorId: d.creatorId,
    creator: d.creator,
    commentCount: d._count.comments,
    likeCount: d._count.likes,
  };
}

async function fetchDiscussions(): Promise<DiscussionWithCounts[]> {
  const res = await apiClient.get<DiscussionsResponse>("/discussions");
  return res.data.discussions.map(toListItem);
}

async function fetchDiscussion(id: string): Promise<DiscussionDetail> {
  const res = await apiClient.get<DiscussionResponse>(`/discussions/${id}`);
  const d = res.data.discussion;
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    creatorId: d.creatorId,
    creator: d.creator,
    comments: d.comments,
    likeCount: d._count.likes,
    likedByMe: d.likedByMe,
  };
}

async function createDiscussionRequest(input: CreateDiscussionInput) {
  return apiClient.post("/discussions", input);
}

async function updateDiscussionRequest({ id, ...body }: UpdateDiscussionInput) {
  return apiClient.patch(`/discussions/${id}`, body);
}

async function deleteDiscussionRequest(id: string) {
  return apiClient.delete(`/discussions/${id}`);
}

async function toggleLikeRequest(id: string) {
  return apiClient.post(`/discussions/${id}/like`);
}

function useDiscussions() {
  return useQuery({
    queryKey: ["discussions"],
    queryFn: fetchDiscussions,
  });
}

function useDiscussion(id: string) {
  return useQuery({
    queryKey: ["discussion", id],
    queryFn: () => fetchDiscussion(id),
    enabled: !!id,
  });
}

function useCreateDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiscussionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

function useUpdateDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiscussionRequest,
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["discussion", input.id] });
    },
  });
}

function useDeleteDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiscussionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

function useToggleLike(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleLikeRequest(id),
    onSuccess: () => {
      // like count lives on both the list row and the detail
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["discussion", id] });
    },
  });
}

export {
  useDiscussions,
  useDiscussion,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useToggleLike,
};

// addComment, deleteComment
// note: no useComments - there's no GET comments endpoint. comments come
// embedded in getDiscussion, so the detail page reads discussion.comments
// off useDiscussion(id) directly.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

type AddCommentInput = { discussionId: string; content: string };
type DeleteCommentInput = { discussionId: string; commentId: string };

async function addCommentRequest({ discussionId, content }: AddCommentInput) {
  return apiClient.post(`/discussions/${discussionId}/comments`, { content });
}

async function deleteCommentRequest({
  discussionId,
  commentId,
}: DeleteCommentInput) {
  return apiClient.delete(`/discussions/${discussionId}/comments/${commentId}`);
}

function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCommentRequest,
    onSuccess: (_data, input) => {
      // comments live inside the detail. count shows on the list row
      queryClient.invalidateQueries({
        queryKey: ["discussion", input.discussionId],
      });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommentRequest,
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ["discussion", input.discussionId],
      });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

export { useAddComment, useDeleteComment };

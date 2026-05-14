// Shelf entries: list, get, addToShelf, updateProgress, updatePrivacy, removeFromShelf
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { BookSearchResult, Progress } from "@/types/schema";

type AddToShelfInput = BookSearchResult & {
  progress: Progress;
  isPrivate?: boolean; // default false
};

async function addToShelfRequest(input: AddToShelfInput) {
  return apiClient.post("/user-books", input);
}

function useAddToShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToShelfRequest,
    onSuccess: () => {
      // catalog grew (if it was a new book) - invalidate browse list
      queryClient.invalidateQueries({ queryKey: ["books"] });
      // TODO: when shelf list hook exists, invalidate ['user-books'] too
    },
  });
}

export { useAddToShelf };

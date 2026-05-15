// Shelf entries: list, get, addToShelf, updateProgress, updatePrivacy, removeFromShelf
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  BookSearchResult,
  Progress,
  UserBookWithBook,
} from "@/types/schema";

type AddToShelfInput = BookSearchResult & {
  progress: Progress;
  isPrivate?: boolean; // default false
};

type UserBooksResponse = {
  data: { userBooks: UserBookWithBook[] };
};

async function addToShelfRequest(input: AddToShelfInput) {
  return apiClient.post("/user-books", input);
}

async function fetchAllUserBooks(
  page: number = 1,
  limit: number = 20,
): Promise<UserBookWithBook[]> {
  const res = await apiClient.get<UserBooksResponse>(
    `/user-books?page=${page}&limit=${limit}`,
  );
  return res.data.userBooks;
}

function useAddToShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToShelfRequest,
    onSuccess: () => {
      // catalog grew (if it was a new book) - invalidate browse list
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["user-books"] });
    },
  });
}

function useUserBooks(page: number = 1, limit: number = 200) {
  return useQuery({
    queryKey: ["user-books", page, limit],
    queryFn: () => fetchAllUserBooks(page, limit),
  });
}

export { useAddToShelf, useUserBooks };

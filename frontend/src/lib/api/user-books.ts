// Shelf entries: list, get, addToShelf, updateProgress, updatePrivacy, removeFromShelf
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  BookSearchResult,
  CustomData,
  Progress,
  UserBookWithBook,
} from "@/types/schema";

type AddToShelfInput = BookSearchResult & {
  progress: Progress;
  isPrivate?: boolean; // default false
};

// backend includes _count for "Continue reading" entry counts (feed page)
type UserBookApi = Omit<UserBookWithBook, "customDataCount"> & {
  _count?: { customData: number };
};
type UserBooksResponse = {
  data: { userBooks: UserBookApi[] };
};

// /user-books/:id - single book with embedded customData
type UserBookResponse = {
  data: { userBook: UserBookWithBook & { customData: CustomData[] } };
};

type UpdateUserBookInput = {
  progress?: Progress;
  isPrivate?: boolean;
};

type PublicUserBooksResponse = {
  data: { friendBooks: UserBookWithBook[] };
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
  // flatten _count -> customDataCount the way the UI types expect
  return res.data.userBooks.map(({ _count, ...rest }) => ({
    ...rest,
    customDataCount: _count?.customData ?? 0,
  }));
}

async function fetchUserBook(
  id: string,
): Promise<UserBookWithBook & { customData: CustomData[] }> {
  const res = await apiClient.get<UserBookResponse>(`/user-books/${id}`);
  return res.data.userBook;
}

async function updateUserBookRequst(id: string, input: UpdateUserBookInput) {
  return apiClient.patch(`/user-books/${id}`, input);
}

async function fetchPublicUserBooks(
  userId: string,
): Promise<UserBookWithBook[]> {
  const res = await apiClient.get<PublicUserBooksResponse>(
    `/user-books/user/${userId}`,
  );
  return res.data.friendBooks;
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

function useUserBook(id: string) {
  return useQuery({
    queryKey: ["user-book", id],
    queryFn: () => fetchUserBook(id),
    enabled: !!id,
  });
}

function useUpdateUserBook(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserBookInput) => updateUserBookRequst(id, input),
    onSuccess: () => {
      // shelf list changes, this entry changes
      queryClient.invalidateQueries({ queryKey: ["user-books"] });
      queryClient.invalidateQueries({ queryKey: ["user-book", id] });
    },
  });
}

function useUserBooksForUser(userId: string) {
  return useQuery({
    queryKey: ["user-books-for-user", userId],
    queryFn: () => fetchPublicUserBooks(userId),
    enabled: !!userId,
  });
}

export {
  useAddToShelf,
  useUserBooks,
  useUserBook,
  useUpdateUserBook,
  useUserBooksForUser,
};

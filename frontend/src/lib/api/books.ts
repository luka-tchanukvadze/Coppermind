import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Book } from "@/types/schema";

// wire shape (what backend sends)
type BooksResponse = {
  total: number;
  page: number;
  totalPages: number;
  data: { books: Book[] };
};

// single - no pagination wrapping
type SingleBookResponse = {
  data: { book: Book };
};

//// unwrapped ////
// (flat for the UI)
type BooksResult = {
  total: number;
  page: number;
  totalPages: number;
  books: Book[];
};

////fetching data//////
async function fetchAllBooks(
  page: number,
  limit: number,
): Promise<BooksResult> {
  const res = await apiClient.get<BooksResponse>(
    `/books?page=${page}&limit=${limit}`,
  );
  // flatten envelope -> result
  return {
    total: res.total,
    page: res.page,
    totalPages: res.totalPages,
    books: res.data.books,
  };
}

async function fetchSingleBook(id: string): Promise<Book> {
  const res = await apiClient.get<SingleBookResponse>(`/books/${id}`);
  return res.data.book;
}

// react query hooks

// page in queryKey -> each page gets its own cache slot
function useBooks(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["books", page, limit],
    queryFn: () => fetchAllBooks(page, limit),
  });
}

// id can be undef on mount - guard with enabled
function useBook(id: string) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchSingleBook(id),
    enabled: !!id,
  });
}

export { useBooks, useBook };

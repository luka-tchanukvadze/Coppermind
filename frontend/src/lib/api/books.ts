// listBooks, getBook, searchBooks
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

type BooksResult = {
  total: number;
  page: number;
  totalPages: number;
  books: Book[];
};

// get all books
async function fetchAllBooks(
  page: number,
  limit: number,
): Promise<BooksResult> {
  const res = await apiClient.get<BooksResponse>(
    `/books?page=${page}&limit=${limit}`,
  );

  return {
    total: res.total,
    page: res.page,
    totalPages: res.totalPages,
    books: res.data.books,
  };
}

function useBooks(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["books", page, limit],
    queryFn: () => fetchAllBooks(page, limit),
  });
}

export { useBooks };

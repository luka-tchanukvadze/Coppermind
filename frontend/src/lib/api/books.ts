import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  Book,
  BookReader,
  BookSearchResult,
  CustomDataWithUser,
  DiscussionWithCounts,
} from "@/types/schema";
import { useDebouncedValue } from "../hooks/use-debounced-value";

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

// search
type SearchResponse = {
  source: "google" | "openlibrary";
  totalItems: number;
  data: { books: BookSearchResult[] };
};

type SearchResult = {
  books: BookSearchResult[];
  source: "google" | "openlibrary";
};

//////////////////
////fetching data//////
//////////////////
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

async function fetchSearchBooks(query: string): Promise<SearchResult> {
  const res = await apiClient.get<SearchResponse>(
    `/books/search?q=${encodeURIComponent(query)}`,
  );

  return {
    books: res.data.books,
    source: res.source,
  };
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

function useSearchBooks(query: string) {
  const debounced = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ["books-search", debounced],
    queryFn: () => fetchSearchBooks(debounced),
    enabled: debounced.trim().length > 2,
  });
}

// book detail tabs - readers / public notes / related discussions
type BookReadersResponse = { data: { readers: BookReader[] } };
type BookNotesResponse = { data: { notes: CustomDataWithUser[] } };
// list shape comes through with flat counts already - see backend bookController
type BookDiscussionsRow = Omit<DiscussionWithCounts, "commentCount" | "likeCount"> & {
  _count: { likes: number; comments: number };
};
type BookDiscussionsResponse = { data: { discussions: BookDiscussionsRow[] } };

async function fetchBookReaders(bookId: string): Promise<BookReader[]> {
  const res = await apiClient.get<BookReadersResponse>(`/books/${bookId}/readers`);
  return res.data.readers;
}

async function fetchBookPublicNotes(
  bookId: string,
): Promise<CustomDataWithUser[]> {
  const res = await apiClient.get<BookNotesResponse>(`/books/${bookId}/notes`);
  return res.data.notes;
}

async function fetchBookDiscussions(
  bookId: string,
): Promise<DiscussionWithCounts[]> {
  const res = await apiClient.get<BookDiscussionsResponse>(
    `/books/${bookId}/discussions`,
  );
  // flatten _count the way the UI types expect
  return res.data.discussions.map((d) => ({
    ...d,
    commentCount: d._count.comments,
    likeCount: d._count.likes,
  }));
}

function useBookReaders(bookId: string) {
  return useQuery({
    queryKey: ["book-readers", bookId],
    queryFn: () => fetchBookReaders(bookId),
    enabled: !!bookId,
  });
}

function useBookPublicNotes(bookId: string) {
  return useQuery({
    queryKey: ["book-notes", bookId],
    queryFn: () => fetchBookPublicNotes(bookId),
    enabled: !!bookId,
  });
}

function useBookDiscussions(bookId: string) {
  return useQuery({
    queryKey: ["book-discussions", bookId],
    queryFn: () => fetchBookDiscussions(bookId),
    enabled: !!bookId,
  });
}

export {
  useBooks,
  useBook,
  useSearchBooks,
  useBookReaders,
  useBookPublicNotes,
  useBookDiscussions,
};

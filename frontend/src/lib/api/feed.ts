// getFeed (paginated activity stream + friends reading sidebar)
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Book, FeedItem, User } from "@/types/schema";

export type FriendReading = {
  user: Pick<User, "id" | "name" | "photo">;
  book: Pick<Book, "id" | "title" | "author" | "coverImage">;
};

export type FeedPage = {
  activity: FeedItem[];
  friendsReading: FriendReading[];
  nextCursor: string | null;
};

type FeedResponse = { data: FeedPage };

async function fetchFeed(cursor?: string): Promise<FeedPage> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const res = await apiClient.get<FeedResponse>(`/feed${qs}`);
  return res.data;
}

// useInfiniteQuery pattern: each page comes back via the queryFn, getNextPageParam
// reads the cursor off the last page so the next call knows where to resume
function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export { useFeed };

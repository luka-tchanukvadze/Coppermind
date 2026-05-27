// useRecommendations - friend-signal + popular fallback, cached 10 min server-side
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export type Recommendation = {
  book: { id: string; title: string; author: string; coverImage: string };
  reason: string;
  friendAvatars: string[];
};

type RecommendationsResponse = {
  data: { recommendations: Recommendation[] };
};

async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await apiClient.get<RecommendationsResponse>("/recommendations");
  return res.data.recommendations;
}

function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
  });
}

export { useRecommendations };

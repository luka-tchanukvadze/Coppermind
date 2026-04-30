import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // dev: don't refetch on window focus, too noisy
        refetchOnWindowFocus: false,
        // fresh for 30s, then refetch on next mount
        staleTime: 30_000,
        // no retry on 4xx (auth/validation errors)
        retry: (count, err) => {
          const status = (err as { status?: number })?.status;
          if (status && status >= 400 && status < 500) return false;
          // 5xx / network blip - retry twice
          return count < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

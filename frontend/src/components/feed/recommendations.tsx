"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BookCover } from "@/components/shared/book-cover";
import { Button } from "@/components/ui/button";
import {
  useRecommendations,
  type Recommendation,
} from "@/lib/api/recommendations";
import { useAddToShelf } from "@/lib/api/user-books";
import { avatarSrc } from "@/lib/avatars";

export function Recommendations() {
  const { data: recs = [], isLoading } = useRecommendations();
  const queryClient = useQueryClient();
  const addToShelf = useAddToShelf();

  const handleAdd = (rec: Recommendation) => {
    // snapshot before removing so I can roll back exactly on error
    const before = queryClient.getQueryData<Recommendation[]>([
      "recommendations",
    ]);

    // optimistic: remove this card from the list immediately
    queryClient.setQueryData<Recommendation[]>(["recommendations"], (old) =>
      old ? old.filter((r) => r.book.id !== rec.book.id) : old,
    );

    addToShelf.mutate(
      {
        title: rec.book.title,
        author: rec.book.author,
        coverImage: rec.book.coverImage,
        // recommended books always already exist in the catalog (the backend
        // upserts by title, so these placeholder fields are ignored)
        genres: [],
        externalApiId: "",
        progress: "WANT_TO_READ",
      },
      {
        onSuccess: () => {
          toast.success(`Added "${rec.book.title}" to your shelf`);
        },
        onError: (err) => {
          // restore the original list exactly as it was
          queryClient.setQueryData<Recommendation[]>(
            ["recommendations"],
            before,
          );
          toast.error(err.message);
        },
      },
    );
  };

  // silent during initial load - sidebar doesn't need a spinner
  if (isLoading) return null;

  if (recs.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
          You might like
        </h2>
        <p className="rounded-md border border-dashed bg-surface/40 p-5 text-center text-sm text-muted">
          No recommendations yet.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
        You might like
      </h2>
      <ul className="space-y-3">
        {recs.map((rec) => (
          <li key={rec.book.id} className="rounded-md border bg-surface p-3">
            <div className="flex gap-3">
              <Link href={`/books/${rec.book.id}`} className="shrink-0">
                <BookCover
                  coverImage={rec.book.coverImage}
                  title={rec.book.title}
                  size="sm"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/books/${rec.book.id}`} className="block">
                  <h3 className="line-clamp-2 font-serif text-sm font-medium leading-tight text-ink hover:text-accent">
                    {rec.book.title}
                  </h3>
                  <p className="truncate text-xs italic text-muted">
                    {rec.book.author}
                  </p>
                </Link>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                  {rec.friendAvatars.length > 0 && (
                    <div className="flex -space-x-1.5">
                      {rec.friendAvatars.map((photo, i) => (
                        <Image
                          key={i}
                          src={avatarSrc(photo)}
                          alt=""
                          width={18}
                          height={18}
                          unoptimized
                          className="h-4.5 w-4.5 rounded-full border border-surface object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <span className="truncate">{rec.reason}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={addToShelf.isPending}
              onClick={() => handleAdd(rec)}
              className="mt-2 w-full justify-center text-xs"
            >
              <Plus className="h-3 w-3" /> Add to shelf
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

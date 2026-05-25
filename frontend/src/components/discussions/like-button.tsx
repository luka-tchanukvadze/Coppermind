"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToggleLike } from "@/lib/api/discussions";

export function LikeButton({
  discussionId,
  initialCount,
  initialLiked = false,
}: {
  discussionId: string;
  initialCount: number;
  initialLiked?: boolean;
}) {
  // liked is local only - backend has no likedByMe, so it resets on refresh
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const toggleLike = useToggleLike(discussionId);

  const handleToggle = () => {
    // optimistic flip
    setCount((c) => (liked ? c - 1 : c + 1));
    setLiked((l) => !l);

    toggleLike.mutate(undefined, {
      onError: () => {
        // roll back
        setCount((c) => (liked ? c + 1 : c - 1));
        setLiked((l) => !l);
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn("gap-1.5", liked && "text-error")}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      {count}
    </Button>
  );
}

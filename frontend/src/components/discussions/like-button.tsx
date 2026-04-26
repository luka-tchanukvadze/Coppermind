"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LikeButton({ initialCount, initialLiked = false }: { initialCount: number; initialLiked?: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setLiked((l) => !l);
        setCount((c) => (liked ? c - 1 : c + 1));
      }}
      className={cn("gap-1.5", liked && "text-error")}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      {count}
    </Button>
  );
}

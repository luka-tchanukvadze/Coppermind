"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function FriendRequestActions({ name }: { name: string }) {
  const [resolved, setResolved] = useState<"accepted" | "declined" | null>(null);

  if (resolved) {
    return (
      <span className="text-xs text-muted">
        {resolved === "accepted" ? "Accepted" : "Declined"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setResolved("declined");
          toast.success("Request declined");
        }}
      >
        <X className="h-3.5 w-3.5" /> Decline
      </Button>
      <Button
        size="sm"
        onClick={() => {
          setResolved("accepted");
          toast.success(`You're now friends with ${name}`);
        }}
      >
        <Check className="h-3.5 w-3.5" /> Accept
      </Button>
    </div>
  );
}

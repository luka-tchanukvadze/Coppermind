"use client";

import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useAcceptFriendRequest,
  useRemoveFriend,
} from "@/lib/api/friends";

interface FriendRequestActionsProps {
  name: string;
  friendId: string;
}

export function FriendRequestActions({ name, friendId }: FriendRequestActionsProps) {
  const accept = useAcceptFriendRequest();
  const decline = useRemoveFriend();

  const busy = accept.isPending || decline.isPending;

  const handleAccept = () => {
    accept.mutate(friendId, {
      onSuccess: () => toast.success(`You're now friends with ${name}`),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDecline = () => {
    decline.mutate(friendId, {
      onSuccess: () => toast.success("Request declined"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    // shrink-0 so the buttons keep their size and the long name truncates
    // instead. tighter padding + smaller text on mobile, full size on sm+
    <div className="flex shrink-0 items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={handleDecline}
        className="px-2 text-xs sm:px-3 sm:text-sm"
      >
        <X className="h-3.5 w-3.5" /> Decline
      </Button>
      <Button
        size="sm"
        disabled={busy}
        onClick={handleAccept}
        className="px-2 text-xs sm:px-3 sm:text-sm"
      >
        <Check className="h-3.5 w-3.5" /> Accept
      </Button>
    </div>
  );
}

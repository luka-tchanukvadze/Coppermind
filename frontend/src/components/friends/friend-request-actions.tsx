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
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={handleDecline}
      >
        <X className="h-3.5 w-3.5" /> Decline
      </Button>
      <Button size="sm" disabled={busy} onClick={handleAccept}>
        <Check className="h-3.5 w-3.5" /> Accept
      </Button>
    </div>
  );
}

"use client";

import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSendFriendRequest } from "@/lib/api/friends";

interface AddFriendButtonProps {
  name: string;
  friendId: string;
}

export function AddFriendButton({ name, friendId }: AddFriendButtonProps) {
  const addFriend = useSendFriendRequest();

  const handleAddFriend = () => {
    addFriend.mutate(friendId, {
      onSuccess: () => toast.success(`Friend request sent to ${name}`),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full"
      disabled={addFriend.isPending || addFriend.isSuccess}
      onClick={handleAddFriend}
    >
      {addFriend.isSuccess ? (
        <>
          <Check className="h-3.5 w-3.5" /> Sent
        </>
      ) : addFriend.isPending ? (
        <>Sending...</>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" /> Add friend
        </>
      )}
    </Button>
  );
}

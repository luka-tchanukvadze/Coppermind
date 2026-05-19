"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRemoveFriend } from "@/lib/api/friends";

interface CancelRequestButtonProps {
  name: string;
  friendId: string;
}

export function CancelRequestButton({ name, friendId }: CancelRequestButtonProps) {
  const cancel = useRemoveFriend();

  const handleCancel = () => {
    cancel.mutate(friendId, {
      onSuccess: () => toast.success(`Request to ${name} cancelled`),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={cancel.isPending}
      onClick={handleCancel}
    >
      {cancel.isPending ? "Cancelling..." : "Cancel"}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AddFriendButton({ name }: { name: string }) {
  const [sent, setSent] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full"
      disabled={sent}
      onClick={() => {
        setSent(true);
        toast.success(`Friend request sent to ${name}`);
      }}
    >
      {sent ? (
        <>
          <Check className="h-3.5 w-3.5" /> Sent
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" /> Add friend
        </>
      )}
    </Button>
  );
}

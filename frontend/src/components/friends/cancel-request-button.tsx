"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ name }: { name: string }) {
  const [cancelled, setCancelled] = useState(false);

  if (cancelled) return <span className="text-xs text-muted">Cancelled</span>;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        setCancelled(true);
        toast.success(`Request to ${name} cancelled`);
      }}
    >
      Cancel
    </Button>
  );
}

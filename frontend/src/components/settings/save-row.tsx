"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SaveRowProps {
  onSave: () => void;
  isPending?: boolean;
  disabled?: boolean;
  label?: string;
}

export function SaveRow({
  onSave,
  isPending = false,
  disabled = false,
  label = "Save changes",
}: SaveRowProps) {
  return (
    <div className="mt-8 flex justify-end">
      <Button onClick={onSave} disabled={isPending || disabled}>
        {isPending ? "Saving..." : label}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Progress } from "@/types/schema";
import { useUpdateUserBook } from "@/lib/api/user-books";
import { toast } from "sonner";

interface StatusSelectProps {
  userBookId: string;
  defaultValue: Progress;
}

export function StatusSelect({ userBookId, defaultValue }: StatusSelectProps) {
  const [value, setValue] = useState<Progress>(defaultValue);
  const updateUserBook = useUpdateUserBook(userBookId);

  const handleChange = (next: Progress) => {
    const prev = value;
    setValue(next); // optimistic - flip UI instantly
    updateUserBook.mutate(
      { progress: next },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => {
          setValue(prev); // revert on failure
          toast.error("Failed to update. Try again?");
        },
      },
    );
  };

  return (
    <Select
      value={value}
      onValueChange={(v) => handleChange(v as Progress)}
      disabled={updateUserBook.isPending}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="WANT_TO_READ">Want to read</SelectItem>
        <SelectItem value="READING">Reading</SelectItem>
        <SelectItem value="READ">Finished</SelectItem>
      </SelectContent>
    </Select>
  );
}

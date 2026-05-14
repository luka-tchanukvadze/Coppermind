"use client";

import { ChevronDown, Check, BookmarkPlus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAddToShelf } from "@/lib/api/user-books";
import { ApiError } from "@/lib/api/client";
import type { BookSearchResult, Progress } from "@/types/schema";

const OPTIONS: { value: Progress; label: string }[] = [
  { value: "WANT_TO_READ", label: "Want to read" },
  { value: "READING", label: "Reading" },
  { value: "READ", label: "Finished" },
];

// turns enum value into the human label for toasts
const labelFor = (p: Progress) =>
  OPTIONS.find((o) => o.value === p)?.label ?? "Want to read";

interface AddToShelfButtonProps {
  book: BookSearchResult;
}

export function AddToShelfButton({ book }: AddToShelfButtonProps) {
  const addToShelf = useAddToShelf();

  // 409 = book already on my shelf. UI treats it the same as success
  const isAlreadyOnShelf =
    addToShelf.isError &&
    addToShelf.error instanceof ApiError &&
    addToShelf.error.status === 409;

  const isPending = addToShelf.isPending;
  const isOnShelf = addToShelf.isSuccess || isAlreadyOnShelf;

  const handleAdd = (progress: Progress) => {
    addToShelf.mutate(
      { ...book, progress, isPrivate: false },
      {
        onSuccess: () => toast.success(`Added as ${labelFor(progress)}`),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast.info("Already on your shelf");
          } else {
            toast.error("Failed to add. Try again?");
          }
        },
      },
    );
  };

  // loading - whole button disabled with spinner
  if (isPending) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="h-4 w-4 animate-spin" /> Adding...
      </Button>
    );
  }

  // success or already on shelf - same end state
  if (isOnShelf) {
    return (
      <Button disabled variant="outline" className="w-full">
        <Check className="h-4 w-4" /> On shelf
      </Button>
    );
  }

  // idle - split button: 1-click default + chevron picker
  return (
    <div className="flex w-full">
      <Button
        onClick={() => handleAdd("WANT_TO_READ")}
        className="flex-1 rounded-r-none"
      >
        <BookmarkPlus className="h-4 w-4" /> Want to Read
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-l-none border-l border-l-white/20 px-2"
            aria-label="Choose status"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => handleAdd(opt.value)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

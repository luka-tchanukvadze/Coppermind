"use client";

import { useState } from "react";
import { ChevronDown, Check, BookmarkPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Progress } from "@/types/schema";

const OPTIONS: { value: Progress; label: string }[] = [
  { value: "WANT_TO_READ", label: "Want to read" },
  { value: "READING", label: "Reading" },
  { value: "READ", label: "Finished" },
];

// Backend: POST /user-books with { title, author, genres, coverImage, externalApiId, progress, isPrivate }.
// On the book-detail page we already know the book metadata; we only collect the status here.
export function AddToShelfButton() {
  const [selected, setSelected] = useState<Progress | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full justify-between">
          <span className="inline-flex items-center gap-2">
            {selected ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            {selected ? OPTIONS.find((o) => o.value === selected)?.label : "Add to shelf"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      {/* w-(--radix-...) is a Radix-exposed CSS var that holds the trigger's width.
          Makes the dropdown match the Add-to-shelf button width exactly. */}
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.value} onSelect={() => setSelected(opt.value)}>
            <Check
              className={cn("h-3.5 w-3.5", selected === opt.value ? "opacity-100" : "opacity-0")}
            />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

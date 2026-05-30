"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// the picker ships a big emoji dataset - load it client-side only and lazily
// so it never bloats the initial chat bundle or runs during SSR
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// emoji insert button for the chat composer. calls onPick with the chosen
// emoji char; the parent appends it to the message input
export function EmojiButton({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Insert emoji"
          className="hidden sm:flex"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      {/* width auto so the picker's own sizing wins; no padding so it sits flush */}
      <PopoverContent
        align="start"
        side="top"
        className="w-auto border-none p-0 shadow-lg"
      >
        <EmojiPicker
          onEmojiClick={(e) => {
            onPick(e.emoji);
            setOpen(false);
          }}
          lazyLoadEmojis
          width={320}
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}

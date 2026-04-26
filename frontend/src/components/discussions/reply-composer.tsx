"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReplyComposer() {
  const [text, setText] = useState("");

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-ink">Write a reply</h3>
      <Textarea
        placeholder="Say what you mean..."
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button
          disabled={text.trim().length === 0}
          onClick={() => {
            setText("");
            toast.success("Reply posted");
          }}
        >
          Post reply
        </Button>
      </div>
    </div>
  );
}

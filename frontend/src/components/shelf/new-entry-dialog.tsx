"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Backend: POST /user-books/:id/custom-data expects { title, content, isPrivate }.
export function NewEntryDialog() {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New entry</DialogTitle>
          <DialogDescription>A note, a quote, a thought, a question. Whatever you want to keep.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="A line that names this thought" maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              placeholder="Write freely. Markdown-style line breaks render as paragraphs."
            />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <div className="text-sm font-medium text-ink">Private entry</div>
              <p className="mt-0.5 text-xs text-muted">When off, friends can see it on your shelf.</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpen(false);
              toast.success("Entry created");
            }}
          >
            Save entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, type ReactNode } from "react";
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

interface Props {
  // Optional custom trigger - lets the dialog be triggered from e.g. a "Start discussion"
  // button on the book detail page. Defaults to a "+ New discussion" primary button.
  trigger?: ReactNode;
}

// Backend: POST /discussions expects { title, description }.
export function NewDiscussionDialog({ trigger }: Props = {}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> New discussion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a discussion</DialogTitle>
          <DialogDescription>Ask a question, share a hot take, kick off a thread.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What are you wondering about?" maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Set the scene. The first paragraph is what people see in the feed."
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpen(false);
              toast.success("Discussion posted");
            }}
          >
            Post discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

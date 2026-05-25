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
import { useCreateDiscussion } from "@/lib/api/discussions";

interface Props {
  // Optional custom trigger - lets the dialog be triggered from e.g. a "Start discussion"
  // button on the book detail page. Defaults to a "+ New discussion" primary button.
  trigger?: ReactNode;
}

// Backend: POST /discussions expects { title, description }.
export function NewDiscussionDialog({ trigger }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createDiscussion = useCreateDiscussion();

  const reset = () => {
    setTitle("");
    setDescription("");
  };

  const handlePost = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    createDiscussion.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success("Discussion posted");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
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

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handlePost();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What are you wondering about?"
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Set the scene. The first paragraph is what people see in the feed."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handlePost} disabled={createDiscussion.isPending}>
            {createDiscussion.isPending ? "Posting..." : "Post discussion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

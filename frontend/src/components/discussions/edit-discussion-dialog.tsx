"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateDiscussion } from "@/lib/api/discussions";

interface EditDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discussionId: string;
  defaultTitle: string;
  defaultDescription: string;
}

// Backend: PATCH /discussions/:id accepts { title, description }.
// Fully controlled (open + onOpenChange props) instead of using a DialogTrigger,
// because the parent (DiscussionActionsMenu) launches it from inside a dropdown
// item - and a DialogTrigger inside a dropdown item doesn't sequence cleanly.
export function EditDiscussionDialog({
  open,
  onOpenChange,
  discussionId,
  defaultTitle,
  defaultDescription,
}: EditDiscussionDialogProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const updateDiscussion = useUpdateDiscussion();

  // re-seed inputs each time the dialog opens (drop any abandoned edits)
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setDescription(defaultDescription);
    }
  }, [open, defaultTitle, defaultDescription]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    updateDiscussion.mutate(
      { id: discussionId, title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Discussion updated");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit discussion</DialogTitle>
          <DialogDescription>Tighten the title or rewrite the body.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="discussion-title">Title</Label>
            <Input
              id="discussion-title"
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discussion-description">Description</Label>
            <Textarea
              id="discussion-description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateDiscussion.isPending}>
            {updateDiscussion.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

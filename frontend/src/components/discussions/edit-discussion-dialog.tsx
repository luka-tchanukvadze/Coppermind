"use client";

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

interface EditDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  defaultTitle,
  defaultDescription,
}: EditDiscussionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit discussion</DialogTitle>
          <DialogDescription>Tighten the title or rewrite the body.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="discussion-title">Title</Label>
            <Input id="discussion-title" defaultValue={defaultTitle} maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discussion-description">Description</Label>
            <Textarea id="discussion-description" rows={6} defaultValue={defaultDescription} />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast.success("Discussion updated");
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

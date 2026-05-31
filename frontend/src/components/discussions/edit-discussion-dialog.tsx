"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  EditDiscussionSchema,
  type EditDiscussionInput,
} from "@/lib/schemas/discussions";

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
  const updateDiscussion = useUpdateDiscussion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditDiscussionInput>({
    resolver: zodResolver(EditDiscussionSchema),
    defaultValues: { title: defaultTitle, description: defaultDescription },
  });

  // re-seed inputs each time the dialog opens (drop any abandoned edits)
  useEffect(() => {
    if (open) reset({ title: defaultTitle, description: defaultDescription });
  }, [open, defaultTitle, defaultDescription, reset]);

  const onValid = (data: EditDiscussionInput) => {
    updateDiscussion.mutate(
      { id: discussionId, title: data.title, description: data.description },
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

        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="discussion-title">Title</Label>
            <Input
              id="discussion-title"
              placeholder="What are you wondering about?"
              maxLength={255}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-error">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discussion-description">Description</Label>
            <Textarea
              id="discussion-description"
              rows={6}
              placeholder="Set the scene. The first paragraph is what people see in the feed."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-error">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDiscussion.isPending}>
              {updateDiscussion.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

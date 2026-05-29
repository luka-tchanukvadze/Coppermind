"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import { useUpdateCustomData } from "@/lib/api/custom-data";

interface EditEntryDialogProps {
  trigger: ReactNode;
  userBookId: string;
  dataId: string;
  defaultTitle: string;
  defaultContent: string;
  defaultIsPrivate: boolean;
}

// Backend: PATCH /user-books/:id/custom-data/:dataId accepts { title, content, isPrivate }.
export function EditEntryDialog({
  trigger,
  userBookId,
  dataId,
  defaultTitle,
  defaultContent,
  defaultIsPrivate,
}: EditEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [isPrivate, setIsPrivate] = useState(defaultIsPrivate);
  const updateCustomData = useUpdateCustomData(userBookId, dataId);

  // re-seed inputs each time the dialog opens (drop any abandoned edits)
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setContent(defaultContent);
      setIsPrivate(defaultIsPrivate);
    }
  }, [open, defaultTitle, defaultContent, defaultIsPrivate]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    updateCustomData.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        isPrivate,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Entry saved");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>
          <DialogDescription>Refine a thought or change its visibility.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="entry-title">Title</Label>
            <Input
              id="entry-title"
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-content">Content</Label>
            <Textarea
              id="entry-content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={updateCustomData.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateCustomData.isPending}>
            {updateCustomData.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

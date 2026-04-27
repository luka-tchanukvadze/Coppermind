"use client";

import { useState, type ReactNode } from "react";
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

interface EditEntryDialogProps {
  trigger: ReactNode;
  defaultTitle: string;
  defaultContent: string;
  defaultIsPrivate: boolean;
}

// Backend: PATCH /user-books/:id/custom-data/:dataId accepts { title, content, isPrivate }.
export function EditEntryDialog({
  trigger,
  defaultTitle,
  defaultContent,
  defaultIsPrivate,
}: EditEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(defaultIsPrivate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>
          <DialogDescription>Refine a thought or change its visibility.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="entry-title">Title</Label>
            <Input id="entry-title" defaultValue={defaultTitle} maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-content">Content</Label>
            <Textarea id="entry-content" rows={8} defaultValue={defaultContent} />
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
              toast.success("Entry saved");
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

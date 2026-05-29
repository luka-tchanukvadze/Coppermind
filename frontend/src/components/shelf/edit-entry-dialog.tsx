"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateCustomData } from "@/lib/api/custom-data";
import { EntrySchema, type EntryInput } from "@/lib/schemas/entries";

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
  const [isPrivate, setIsPrivate] = useState(defaultIsPrivate);
  const updateCustomData = useUpdateCustomData(userBookId, dataId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryInput>({
    resolver: zodResolver(EntrySchema),
    defaultValues: { title: defaultTitle, content: defaultContent },
  });

  // re-seed inputs each time the dialog opens (drop any abandoned edits)
  useEffect(() => {
    if (open) {
      reset({ title: defaultTitle, content: defaultContent });
      setIsPrivate(defaultIsPrivate);
    }
  }, [open, defaultTitle, defaultContent, defaultIsPrivate, reset]);

  const onValid = (data: EntryInput) => {
    updateCustomData.mutate(
      { title: data.title, content: data.content, isPrivate },
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

        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="entry-title">Title</Label>
            <Input id="entry-title" maxLength={255} {...register("title")} />
            {errors.title && (
              <p className="text-xs text-error">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-content">Content</Label>
            <Textarea id="entry-content" rows={8} {...register("content")} />
            {errors.content && (
              <p className="text-xs text-error">{errors.content.message}</p>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <div className="text-sm font-medium text-ink">Private entry</div>
              <p className="mt-0.5 text-xs text-muted">When off, friends can see it on your shelf.</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={updateCustomData.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCustomData.isPending}>
              {updateCustomData.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

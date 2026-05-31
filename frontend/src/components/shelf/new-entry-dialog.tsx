"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAddCustomData } from "@/lib/api/custom-data";
import { EntrySchema, type EntryInput } from "@/lib/schemas/entries";

interface NewEntryDialogProps {
  userBookId: string;
}

// Backend: POST /user-books/:id/custom-data expects { title, content, isPrivate }.
export function NewEntryDialog({ userBookId }: NewEntryDialogProps) {
  const [open, setOpen] = useState(false);
  // isPrivate stays outside the form since Switch isn't a native input
  const [isPrivate, setIsPrivate] = useState(true);
  const addCustomData = useAddCustomData(userBookId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryInput>({
    resolver: zodResolver(EntrySchema),
    defaultValues: { title: "", content: "" },
  });

  const resetAll = () => {
    reset({ title: "", content: "" });
    setIsPrivate(true);
  };

  const onValid = (data: EntryInput) => {
    addCustomData.mutate(
      { title: data.title, content: data.content, isPrivate },
      {
        onSuccess: () => {
          setOpen(false);
          resetAll();
          toast.success("Entry created");
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
        if (!next) resetAll();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New entry</DialogTitle>
          <DialogDescription>
            A note, a quote, a thought, a question. Whatever you want to keep.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="A line that names this thought"
              maxLength={255}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-error">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              placeholder="Write anything you want to remember. It's saved here for you."
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-error">{errors.content.message}</p>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <div className="text-sm font-medium text-ink">Private entry</div>
              <p className="mt-0.5 text-xs text-muted">
                When off, friends can see it on your shelf.
              </p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={addCustomData.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addCustomData.isPending}>
              {addCustomData.isPending ? "Saving..." : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

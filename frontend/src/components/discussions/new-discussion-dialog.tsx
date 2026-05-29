"use client";

import { useState, type ReactNode } from "react";
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
import { BookPicker } from "./book-picker";
import { useCreateDiscussion } from "@/lib/api/discussions";
import {
  NewDiscussionSchema,
  type NewDiscussionInput,
} from "@/lib/schemas/discussions";
import type { Book } from "@/types/schema";

interface Props {
  // Optional custom trigger - lets the dialog be triggered from e.g. a "Start discussion"
  // button on the book detail page. Defaults to a "+ New discussion" primary button.
  trigger?: ReactNode;
  // when launched from a book detail page, the book is preselected (and not removable
  // via the picker chip - that would be confusing in context)
  preselectedBook?: Book;
}

// Backend: POST /discussions expects { title, description, bookId? }
export function NewDiscussionDialog({ trigger, preselectedBook }: Props = {}) {
  const [open, setOpen] = useState(false);
  // book is kept outside react-hook-form since BookPicker is a custom control
  const [book, setBook] = useState<Book | null>(preselectedBook ?? null);
  const createDiscussion = useCreateDiscussion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewDiscussionInput>({
    resolver: zodResolver(NewDiscussionSchema),
    defaultValues: { title: "", description: "" },
  });

  const resetAll = () => {
    reset({ title: "", description: "" });
    setBook(preselectedBook ?? null);
  };

  const onValid = (data: NewDiscussionInput) => {
    createDiscussion.mutate(
      { title: data.title, description: data.description, bookId: book?.id ?? null },
      {
        onSuccess: () => {
          setOpen(false);
          resetAll();
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
        if (!next) resetAll();
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
          <DialogDescription>
            Ask a question, share a hot take, kick off a thread.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What are you wondering about?"
              maxLength={255}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-error">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>About a book? (optional)</Label>
            <BookPicker value={book} onChange={setBook} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDiscussion.isPending}>
              {createDiscussion.isPending ? "Posting..." : "Post discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { type Ref } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddComment } from "@/lib/api/comments";
import {
  AddCommentSchema,
  type AddCommentInput,
} from "@/lib/schemas/discussions";

export function ReplyComposer({
  discussionId,
  textareaRef,
}: {
  discussionId: string;
  // optional ref so the parent can scroll to + focus the box (e.g. from the
  // "X replies" button). merged with RHF's own ref below
  textareaRef?: Ref<HTMLTextAreaElement>;
}) {
  const addComment = useAddComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCommentInput>({
    resolver: zodResolver(AddCommentSchema),
    defaultValues: { content: "" },
  });

  // RHF's register returns its own ref; pull it out so I can call it AND the
  // caller's ref on the same node
  const { ref: rhfRef, ...contentField } = register("content");

  const onValid = (data: AddCommentInput) => {
    addComment.mutate(
      { discussionId, content: data.content },
      {
        onSuccess: () => {
          reset({ content: "" });
          toast.success("Reply posted");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <h3 className="mb-3 text-sm font-medium text-ink">Write a reply</h3>
      <Textarea
        placeholder="Say what you mean..."
        rows={4}
        {...contentField}
        ref={(node) => {
          // feed the node to both RHF and the caller's ref
          rhfRef(node);
          if (typeof textareaRef === "function") textareaRef(node);
          else if (textareaRef) textareaRef.current = node;
        }}
      />
      {errors.content && (
        <p className="mt-1 text-xs text-error">{errors.content.message}</p>
      )}
      <div className="mt-3 flex justify-end">
        <Button type="submit" disabled={addComment.isPending}>
          {addComment.isPending ? "Posting..." : "Post reply"}
        </Button>
      </div>
    </form>
  );
}

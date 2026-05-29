"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddComment } from "@/lib/api/comments";
import { AddCommentSchema, type AddCommentInput } from "@/lib/schemas/discussions";

export function ReplyComposer({ discussionId }: { discussionId: string }) {
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
        {...register("content")}
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

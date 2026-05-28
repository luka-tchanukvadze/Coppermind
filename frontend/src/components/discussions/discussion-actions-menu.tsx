"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditDiscussionDialog } from "./edit-discussion-dialog";
import { useDeleteDiscussion } from "@/lib/api/discussions";
import { useDeleteComment } from "@/lib/api/comments";

interface Props {
  kind?: "discussion" | "comment";
  discussionId: string;
  commentId?: string; // required for comment kind
  // For discussion kind only - prefills the edit dialog.
  title?: string;
  description?: string;
  // moderator delete on someone else's content - hides the edit option
  // (admins moderate, they don't rewrite people's posts)
  asAdmin?: boolean;
}

// Shown for the content owner OR an admin. Owner gets edit + delete on
// a discussion (delete only on a comment, since there's no PATCH /comments).
// Admin only ever gets delete - they're a mod, not a rewriter.
export function DiscussionActionsMenu({
  kind = "discussion",
  discussionId,
  commentId,
  title = "",
  description = "",
  asAdmin = false,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const deleteDiscussion = useDeleteDiscussion();
  const deleteComment = useDeleteComment();

  const isPending = deleteDiscussion.isPending || deleteComment.isPending;

  const handleDelete = () => {
    if (kind === "discussion") {
      deleteDiscussion.mutate(discussionId, {
        onSuccess: () => {
          setDeleteOpen(false);
          toast.success("Discussion deleted");
          // the detail page we're on no longer exists
          router.push("/discussions");
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      deleteComment.mutate(
        { discussionId, commentId: commentId! },
        {
          onSuccess: () => {
            setDeleteOpen(false);
            toast.success("Reply deleted");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {kind === "discussion" && !asAdmin && (
            <DropdownMenuItem
              // preventDefault stops Radix from auto-closing the menu before the
              // dialog opens. Without it the dialog flashes and dismisses.
              onSelect={(e) => {
                e.preventDefault();
                setEditOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-error focus:text-error"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete {kind}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {kind === "discussion" && !asAdmin && (
        <EditDiscussionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          discussionId={discussionId}
          defaultTitle={title}
          defaultDescription={description}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this {kind}?</DialogTitle>
            <DialogDescription>
              {kind === "discussion"
                ? "All replies and likes will be deleted too. This can't be undone."
                : "Your reply will be removed. This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : `Delete ${kind}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

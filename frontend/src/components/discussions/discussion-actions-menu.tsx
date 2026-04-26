"use client";

import { useState } from "react";
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

interface Props {
  kind?: "discussion" | "comment";
  // For discussion kind only - prefills the edit dialog.
  title?: string;
  description?: string;
}

// Shown only when the current user owns the discussion (or comment).
// Discussion kind offers edit + delete; comment kind offers delete only
// (backend has no PATCH /comments route).
export function DiscussionActionsMenu({ kind = "discussion", title = "", description = "" }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {kind === "discussion" && (
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

      {kind === "discussion" && (
        <EditDiscussionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
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
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                toast.success(kind === "discussion" ? "Discussion deleted" : "Reply deleted");
              }}
            >
              Delete {kind}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { useRemoveFromShelf } from "@/lib/api/user-books";

export function RemoveFromShelfMenu({ userBookId }: { userBookId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const removeFromShelf = useRemoveFromShelf(userBookId);

  const handleRemove = () => {
    removeFromShelf.mutate(undefined, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success("Book removed from shelf");
        router.push("/shelf");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-error focus:text-error"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash className="h-3.5 w-3.5" /> Remove from shelf
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this book from your shelf?</DialogTitle>
            <DialogDescription>
              Your notes and entries on this book will be deleted too. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={removeFromShelf.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeFromShelf.isPending}
            >
              {removeFromShelf.isPending ? "Removing..." : "Remove book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

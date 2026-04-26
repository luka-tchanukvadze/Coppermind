"use client";

import { useState } from "react";
import { MoreHorizontal, UserMinus } from "lucide-react";
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

// Backend: DELETE /friends/:friendId removes the connection in either direction.
export function FriendCardMenu({ friendName }: { friendName: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="More">
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
            <UserMinus className="h-3.5 w-3.5" /> Remove friend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {friendName}?</DialogTitle>
            <DialogDescription>
              You won&apos;t be able to see each other&apos;s shelves or message each other.
              You can re-send a friend request any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                toast.success(`${friendName} removed`);
              }}
            >
              Remove friend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useUpdatePassword } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";

// Backend: PATCH /users/updateMyPassword expects currentPassword, newPassword, newPasswordConfirm.
export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const updatePassword = useUpdatePassword();

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const closeAndReset = () => {
    if (updatePassword.isPending) return;
    setOpen(false);
    reset();
  };

  const handleSave = () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("Passwords don't match");
      return;
    }

    updatePassword.mutate(
      { currentPassword, newPassword, newPasswordConfirm },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success("Password updated");
        },
        onError: (err) => {
          // 401 = backend says current password is wrong
          if (err instanceof ApiError && err.status === 401) {
            toast.error("Current password is wrong");
          } else {
            toast.error("Failed to update. Try again?");
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeAndReset())}>
      <DialogTrigger asChild>
        <Button variant="outline">Change password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Other devices stay signed in until they hit a protected route.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={updatePassword.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={updatePassword.isPending}
            />
            <p className="text-xs text-muted">Minimum 8 characters.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPasswordConfirm">Confirm new password</Label>
            <Input
              id="newPasswordConfirm"
              type="password"
              autoComplete="new-password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              disabled={updatePassword.isPending}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={closeAndReset}
            disabled={updatePassword.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updatePassword.isPending}>
            {updatePassword.isPending ? "Updating..." : "Update password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

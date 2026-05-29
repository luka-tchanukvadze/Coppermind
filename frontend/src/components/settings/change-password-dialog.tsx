"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useUpdatePassword } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import {
  UpdatePasswordSchema,
  type UpdatePasswordInput,
} from "@/lib/schemas/auth";

// Backend: PATCH /users/updateMyPassword expects currentPassword, newPassword, newPasswordConfirm.
export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const closeAndReset = () => {
    if (updatePassword.isPending) return;
    setOpen(false);
    reset({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
  };

  const onValid = (data: UpdatePasswordInput) => {
    updatePassword.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
        toast.success("Password updated");
      },
      onError: (err) => {
        // 401 = backend says current password is wrong
        if (err instanceof ApiError && err.status === 401) {
          toast.error("Current password is wrong");
        } else {
          toast.error(err.message);
        }
      },
    });
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

        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              disabled={updatePassword.isPending}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-error">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              disabled={updatePassword.isPending}
              {...register("newPassword")}
            />
            {errors.newPassword ? (
              <p className="text-xs text-error">{errors.newPassword.message}</p>
            ) : (
              <p className="text-xs text-muted">Minimum 8 characters.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPasswordConfirm">Confirm new password</Label>
            <Input
              id="newPasswordConfirm"
              type="password"
              autoComplete="new-password"
              disabled={updatePassword.isPending}
              {...register("newPasswordConfirm")}
            />
            {errors.newPasswordConfirm && (
              <p className="text-xs text-error">
                {errors.newPasswordConfirm.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={closeAndReset}
              disabled={updatePassword.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePassword.isPending}>
              {updatePassword.isPending ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

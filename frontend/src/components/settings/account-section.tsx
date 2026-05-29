"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "./section-header";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useUpdateMe } from "@/lib/api/users";
import {
  UpdateEmailSchema,
  type UpdateEmailInput,
} from "@/lib/schemas/profile";

export function AccountSection({ email }: { email: string }) {
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateEmailInput>({
    resolver: zodResolver(UpdateEmailSchema),
    defaultValues: { email },
  });

  // re-seed the form if the email prop changes (after a successful save)
  useEffect(() => {
    reset({ email });
  }, [email, reset]);

  const currentEmail = watch("email");
  const isDirty = currentEmail !== email;

  const onValid = (data: UpdateEmailInput) => {
    updateMe.mutate(data, {
      onSuccess: () => toast.success("Email updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <section>
      <SectionHeader title="Account" description="How you sign in." />
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onValid)}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="email"
                type="email"
                className="flex-1"
                {...register("email")}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={!isDirty || updateMe.isPending}
              >
                {updateMe.isPending ? "Saving..." : "Change email"}
              </Button>
            </div>
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>
        </form>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="password"
              value="••••••••••"
              readOnly
              className="flex-1"
            />
            <ChangePasswordDialog />
          </div>
        </div>
      </div>
    </section>
  );
}

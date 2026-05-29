"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/lib/api/auth";
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // unwrap the async params (Next 15 App Router pattern)
  const { token } = use(params);
  const router = useRouter();
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  const onValid = (data: ResetPasswordInput) => {
    resetPassword.mutate(
      { token, ...data },
      {
        onSuccess: () => {
          toast.success("Password reset. You're signed in.");
          router.push("/feed");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">Use at least 8 characters.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-error">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="passwordConfirm">Confirm new password</Label>
          <Input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            {...register("passwordConfirm")}
          />
          {errors.passwordConfirm && (
            <p className="text-xs text-error">{errors.passwordConfirm.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-muted hover:text-ink">
          Back to login
        </Link>
      </p>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/shared/avatar-picker";
import { useSignup } from "@/lib/api/auth";
import { SignupSchema, type SignupInput } from "@/lib/schemas/auth";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const router = useRouter();
  const signup = useSignup();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) });

  const onValid = (data: SignupInput) => {
    signup.mutate(data, {
      onSuccess: () => {
        // start the new account from a clean cache (in case the tab held a
        // prior session's data)
        queryClient.clear();
        // one-shot flag: feed greets a brand-new account with "Hello there"
        // instead of "Welcome back", then clears it so refreshes/logins don't
        sessionStorage.setItem("greeting", "new");
        router.push(
          returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
            ? returnUrl
            : "/feed",
        );
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">
          Start your shelf
        </h1>
        <p className="mt-1 text-sm text-muted">Takes about a minute.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="How should we call you?"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-error">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@reader.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="password_confirm">Confirm password</Label>
          <Input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            {...register("password_confirm")}
          />
          {errors.password_confirm && (
            <p className="text-xs text-error">
              {errors.password_confirm.message}
            </p>
          )}
        </div>

        <div className="pt-1">
          <AvatarPicker
            label="Choose your order"
            size="sm"
            onChange={(fileName) =>
              setValue("photo", fileName, { shouldValidate: true })
            }
          />
          <p className="mt-2 text-xs text-muted">You can change this later.</p>
        </div>

        <Button type="submit" disabled={signup.isPending} className="w-full">
          {signup.isPending ? "Creating..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already reading with us?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

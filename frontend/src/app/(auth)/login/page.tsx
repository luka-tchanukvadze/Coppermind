"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { type LoginInput, LoginSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const handleLogin = (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["me"] });
        router.push("/feed");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted">Sign in to your library.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-error">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/api/auth";
import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgot = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onValid = (data: ForgotPasswordInput) => {
    forgot.mutate(data, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email. If it&apos;s registered, we&apos;ll send a reset link. The link is valid for 10 minutes.
        </p>
      </div>

      {submitted ? (
        <p className="rounded-md border bg-muted-bg/30 p-4 text-sm text-ink">
          Check your inbox. If the email is registered, a reset link is on its way.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onValid)}>
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
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="inline-flex items-center gap-1 text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/shared/avatar-picker";
import React, { useState } from "react";
import { useSignup } from "@/lib/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: "",
    password: "",
    password_confirm: "",
  });
  const signup = useSignup();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signup.mutate(formData, {
      onSuccess: () => router.push("/feed"),
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="How should we call you?"
            autoComplete="name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@reader.com"
            autoComplete="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password_confirm">Confirm password</Label>
          <Input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            onChange={(e) =>
              setFormData({ ...formData, password_confirm: e.target.value })
            }
          />
        </div>

        <div className="pt-1">
          <AvatarPicker
            label="Choose your order"
            size="sm"
            onChange={(fileName) =>
              setFormData({ ...formData, photo: fileName })
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

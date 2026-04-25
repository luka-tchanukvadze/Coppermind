import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email. If it&apos;s registered, we&apos;ll send a reset link. The link is valid for 10 minutes.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@reader.com" autoComplete="email" />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="inline-flex items-center gap-1 text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      </p>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await params; // token would be sent to backend on submit
  return (
    <div className="rounded-lg border bg-surface p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium leading-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">Use at least 8 characters.</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" />
        </div>
        <Button asChild className="w-full">
          <Link href="/feed">Reset password</Link>
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

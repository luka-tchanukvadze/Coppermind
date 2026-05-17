"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "./section-header";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useUpdateMe } from "@/lib/api/users";

export function AccountSection({ email }: { email: string }) {
  const [currentEmail, setCurrentEmail] = useState(email);
  const updateMe = useUpdateMe();

  const isDirty = currentEmail !== email;

  const handleSave = () => {
    if (!currentEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    updateMe.mutate(
      { email: currentEmail.trim() },
      {
        onSuccess: () => toast.success("Email updated"),
        onError: () => toast.error("Failed to update. Try again?"),
      },
    );
  };

  return (
    <section>
      <SectionHeader title="Account" description="How you sign in." />
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || updateMe.isPending}
            >
              {updateMe.isPending ? "Saving..." : "Change email"}
            </Button>
          </div>
        </div>
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

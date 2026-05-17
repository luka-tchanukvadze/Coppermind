"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SectionHeader } from "./section-header";
import { useDeleteMe } from "@/lib/api/users";

export function DangerSection() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteMe = useDeleteMe();

  const handleDeactivate = () => {
    deleteMe.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.push("/");
        toast.success("Account deactivated. You've been signed out.");
      },
      onError: () => toast.error("Failed to deactivate. Try again?"),
    });
  };

  return (
    <section>
      <SectionHeader
        title="Danger zone"
        description="Irreversible actions. Take a breath first."
      />
      <div className="rounded-md border border-error/30 bg-error/5 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-ink">Deactivate account</div>
            <p className="mt-1 max-w-prose text-sm text-muted">
              Disables logins. Existing content stays visible.
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={(o) => !deleteMe.isPending && setOpen(o)}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="shrink-0 border-error/40 text-error hover:bg-error/10"
              >
                Deactivate account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate your account?</DialogTitle>
                <DialogDescription>
                  You will be signed out and unable to log back in.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={deleteMe.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-error/40 text-error hover:bg-error/10"
                  onClick={handleDeactivate}
                  disabled={deleteMe.isPending}
                >
                  {deleteMe.isPending ? "Deactivating..." : "Yes, deactivate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

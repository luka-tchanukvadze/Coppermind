import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

// Backend currently only supports soft delete via DELETE /users/deleteMe (sets active: false).
// There is no hard-delete endpoint, so we only surface "Deactivate" here.
export function DangerSection() {
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
              Hide your profile, shelves, and notes from everyone. You can reactivate any time by
              logging back in. To permanently delete your account and all your data, contact
              support.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-error/40 text-error hover:bg-error/10">
            Deactivate account
          </Button>
        </div>
      </div>
    </section>
  );
}

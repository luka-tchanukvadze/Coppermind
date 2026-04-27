import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "./section-header";
import { ChangePasswordDialog } from "./change-password-dialog";

export function AccountSection({ email }: { email: string }) {
  return (
    <section>
      <SectionHeader title="Account" description="How you sign in." />
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="email" type="email" defaultValue={email} className="flex-1" />
            <Button variant="outline">Change email</Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input type="password" value="••••••••••" readOnly className="flex-1" />
            <ChangePasswordDialog />
          </div>
        </div>
      </div>
    </section>
  );
}

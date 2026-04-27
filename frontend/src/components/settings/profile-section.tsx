import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/shared/avatar-picker";
import { SectionHeader } from "./section-header";
import { SaveRow } from "./save-row";

export function ProfileSection({ name, photo }: { name: string; photo: string }) {
  return (
    <section>
      <SectionHeader title="Profile" description="How others see you." />
      <div className="space-y-8">
        <div className="space-y-3">
          <Label>Avatar</Label>
          <AvatarPicker defaultValue={photo} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" defaultValue={name} className="max-w-md" />
        </div>
      </div>
      <SaveRow />
    </section>
  );
}

// Note: backend updateMe accepts {name, email, photo} only - bio/location/website
// have no schema fields, so we don't surface them.

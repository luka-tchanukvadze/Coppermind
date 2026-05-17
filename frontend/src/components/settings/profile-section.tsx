"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/shared/avatar-picker";
import { SectionHeader } from "./section-header";
import { SaveRow } from "./save-row";
import { useState } from "react";
import { useUpdateMe } from "@/lib/api/users";
import { toast } from "sonner";

export function ProfileSection({
  name,
  photo,
}: {
  name: string;
  photo: string;
}) {
  const [currentName, setCurrentName] = useState(name);
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const updateMe = useUpdateMe();

  // disable save button until something actually changed
  const isDirty = currentName !== name || currentPhoto !== photo;

  const handleSave = () => {
    if (!currentName.trim()) {
      toast.error("Name is required");
      return;
    }

    updateMe.mutate(
      { name: currentName.trim(), photo: currentPhoto },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: () => toast.error("Failed to update. Try again?"),
      },
    );
  };

  return (
    <section>
      <SectionHeader title="Profile" description="How others see you." />
      <div className="space-y-8">
        <div className="space-y-3">
          <Label>Avatar</Label>
          <AvatarPicker
            defaultValue={currentPhoto}
            onChange={setCurrentPhoto}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>
      <SaveRow
        onSave={handleSave}
        isPending={updateMe.isPending}
        disabled={!isDirty}
      />
    </section>
  );
}

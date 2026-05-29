"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarPicker } from "@/components/shared/avatar-picker";
import { SectionHeader } from "./section-header";
import { SaveRow } from "./save-row";
import { useUpdateMe } from "@/lib/api/users";
import {
  UpdateNameSchema,
  type UpdateNameInput,
} from "@/lib/schemas/profile";

export function ProfileSection({
  name,
  photo,
}: {
  name: string;
  photo: string;
}) {
  // photo lives outside react-hook-form since AvatarPicker is a custom control
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateNameInput>({
    resolver: zodResolver(UpdateNameSchema),
    defaultValues: { name },
  });

  // re-seed when props update after a successful save
  useEffect(() => {
    reset({ name });
    setCurrentPhoto(photo);
  }, [name, photo, reset]);

  const currentName = watch("name");
  const isDirty = currentName !== name || currentPhoto !== photo;

  const onValid = (data: UpdateNameInput) => {
    updateMe.mutate(
      { name: data.name, photo: currentPhoto },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <section>
      <SectionHeader title="Profile" description="How others see you." />
      <form onSubmit={handleSubmit(onValid)}>
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
            <Input id="name" className="max-w-md" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>
        </div>
        <SaveRow
          onSave={handleSubmit(onValid)}
          isPending={updateMe.isPending}
          disabled={!isDirty}
        />
      </form>
    </section>
  );
}

"use client";

/* TODO: settings privacy section is commented out for now (not wired to backend).
   When/if it comes back, it'll need its own mutation (user-level defaults, not
   per-book). Cleaner answer is to make this component purely presentational
   (value + onCheckedChange) so each caller owns its own mutation. */

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateUserBook } from "@/lib/api/user-books";
import { toast } from "sonner";

interface PrivacySwitchProps {
  defaultValue: boolean;
  label: string;
  helper?: string;
  // idSuffix keeps the htmlFor/id pair unique when multiple switches render
  // on the same page (e.g. settings page has two: book privacy + entry privacy).
  // Pass the userBook id or any stable string.
  idSuffix?: string;
  userBookId?: string; // if present, fires the user-book mutattion
}

export function PrivacySwitch({
  defaultValue,
  label,
  helper,
  idSuffix = "priv",
  userBookId,
}: PrivacySwitchProps) {
  const [on, setOn] = useState(defaultValue);
  const updateUserBook = useUpdateUserBook(userBookId ?? "");
  const id = `priv-${idSuffix}`;

  const handleChange = (checked: boolean) => {
    // no userBookId = settings context, jsut flic local this.state.
    if (!userBookId) {
      setOn(checked);
      return;
    }

    const prev = on;
    setOn(checked); // optimistic
    updateUserBook.mutate(
      {
        isPrivate: checked,
      },
      {
        onSuccess: () => toast.success("Privacy updated"),
        onError: () => {
          setOn(prev); // revert
          toast.error("Failed to update. Try again?");
        },
      },
    );
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="block text-sm font-medium">
          {label}
        </Label>
        {helper && <p className="mt-0.5 text-xs text-muted">{helper}</p>}
      </div>
      <Switch
        id={id}
        checked={on}
        onCheckedChange={handleChange}
        disabled={updateUserBook.isPending}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PrivacySwitchProps {
  defaultValue: boolean;
  label: string;
  helper?: string;
  // idSuffix keeps the htmlFor/id pair unique when multiple switches render
  // on the same page (e.g. settings page has two: book privacy + entry privacy).
  // Pass the userBook id or any stable string.
  idSuffix?: string;
}

export function PrivacySwitch({ defaultValue, label, helper, idSuffix = "priv" }: PrivacySwitchProps) {
  const [on, setOn] = useState(defaultValue);
  const id = `priv-${idSuffix}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="block text-sm font-medium">
          {label}
        </Label>
        {helper && <p className="mt-0.5 text-xs text-muted">{helper}</p>}
      </div>
      <Switch id={id} checked={on} onCheckedChange={setOn} />
    </div>
  );
}

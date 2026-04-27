"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface PrivacyRowProps {
  title: string;
  description: string;
  defaultChecked: boolean;
}

export function PrivacyRow({ title, description, defaultChecked }: PrivacyRowProps) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div>
        <div className="font-medium text-ink">{title}</div>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

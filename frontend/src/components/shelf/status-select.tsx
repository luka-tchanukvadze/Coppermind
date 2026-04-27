"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Progress } from "@/types/schema";

export function StatusSelect({ defaultValue }: { defaultValue: Progress }) {
  const [value, setValue] = useState<Progress>(defaultValue);
  return (
    <Select value={value} onValueChange={(v) => setValue(v as Progress)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="WANT_TO_READ">Want to read</SelectItem>
        <SelectItem value="READING">Reading</SelectItem>
        <SelectItem value="READ">Finished</SelectItem>
      </SelectContent>
    </Select>
  );
}

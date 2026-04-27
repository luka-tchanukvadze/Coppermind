"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SaveRow({ message = "Settings saved" }: { message?: string } = {}) {
  return (
    <div className="mt-8 flex justify-end">
      <Button onClick={() => toast.success(message)}>Save changes</Button>
    </div>
  );
}

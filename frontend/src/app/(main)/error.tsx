"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// catches render/runtime throws inside the main app shell so one bad data
// shape shows a recoverable card instead of a white screen. the nav stays
// mounted (this only replaces the page content). reset() retries the segment
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // surface it for debugging - real logging can hook in here later
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-serif text-2xl font-medium text-ink">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This page hit a snag. Try again, and if it keeps happening, head back
        home.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/feed")}>
          Go home
        </Button>
      </div>
    </div>
  );
}

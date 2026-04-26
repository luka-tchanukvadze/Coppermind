import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemoveFromShelfMenu } from "@/components/shelf/remove-from-shelf-menu";

export function BackBar() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href="/shelf">
          <ArrowLeft className="h-4 w-4" /> Back to shelf
        </Link>
      </Button>
      <RemoveFromShelfMenu />
    </div>
  );
}

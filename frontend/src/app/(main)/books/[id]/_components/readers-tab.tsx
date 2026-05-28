import Link from "next/link";
import { UserPic } from "@/components/shared/user-pic";
import type { BookReader, Progress } from "@/types/schema";

function statusLabel(progress: Progress): string {
  switch (progress) {
    case "READING":
      return "Currently reading";
    case "READ":
      return "Finished";
    case "WANT_TO_READ":
      return "Want to read";
  }
}

export function ReadersTab({ readers }: { readers: BookReader[] }) {
  if (!readers.length)
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        No one&apos;s added this yet. Be the first to put it on your shelf.
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {readers.map(({ user, progress }) => (
        <Link
          key={user.id}
          href={`/profile/${user.id}`}
          className="flex items-center gap-3 rounded-md border bg-surface p-3 transition-colors hover:border-border-strong"
        >
          <UserPic photo={user.photo} name={user.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink">{user.name}</div>
            <div className="text-xs text-muted">{statusLabel(progress)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

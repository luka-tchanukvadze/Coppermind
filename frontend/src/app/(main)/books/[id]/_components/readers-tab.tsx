import Link from "next/link";
import { UserPic } from "@/components/shared/user-pic";
import type { User } from "@/types/schema";

export interface ReaderEntry {
  user: User;
  status: string;
}

export function ReadersTab({ readers }: { readers: ReaderEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {readers.map(({ user, status }) => (
        <Link
          key={user.id}
          href={`/profile/${user.id}`}
          className="flex items-center gap-3 rounded-md border bg-surface p-3 transition-colors hover:border-border-strong"
        >
          <UserPic photo={user.photo} name={user.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink">{user.name}</div>
            <div className="text-xs text-muted">{status}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

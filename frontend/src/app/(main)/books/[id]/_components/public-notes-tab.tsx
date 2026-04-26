import { UserPic } from "@/components/shared/user-pic";
import { getUser } from "@/lib/mocks/dummy";
import { formatRelative } from "@/lib/format";
import type { CustomData } from "@/types/schema";

export function PublicNotesTab({ notes }: { notes: CustomData[] }) {
  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const user = getUser(note.userId);
        return (
          <article key={note.id} className="rounded-md border bg-surface p-5">
            <header className="mb-3 flex items-center gap-2.5">
              <UserPic photo={user.photo} name={user.name} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{user.name}</div>
                <div className="text-xs text-muted">{formatRelative(note.createdAt)}</div>
              </div>
            </header>
            <h3 className="wrap-break-word font-serif text-lg font-medium text-ink">{note.title}</h3>
            <p className="mt-1.5 line-clamp-3 wrap-break-word text-sm leading-relaxed text-ink/85">
              {note.content}
            </p>
          </article>
        );
      })}
    </div>
  );
}

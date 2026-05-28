import { UserPic } from "@/components/shared/user-pic";
import { formatRelative } from "@/lib/format";
import type { CustomDataWithUser } from "@/types/schema";

export function PublicNotesTab({ notes }: { notes: CustomDataWithUser[] }) {
  if (!notes.length)
    return (
      <div className="rounded-lg border bg-surface p-8 text-center text-sm text-muted">
        No public notes yet. Add one from your shelf entry to share your take.
      </div>
    );

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <article key={note.id} className="rounded-md border bg-surface p-5">
          <header className="mb-3 flex items-center gap-2.5">
            <UserPic photo={note.user.photo} name={note.user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-ink">{note.user.name}</div>
              <div className="text-xs text-muted">{formatRelative(note.createdAt)}</div>
            </div>
          </header>
          <h3 className="wrap-break-word font-serif text-lg font-medium text-ink">{note.title}</h3>
          <p className="mt-1.5 line-clamp-3 wrap-break-word text-sm leading-relaxed text-ink/85">
            {note.content}
          </p>
        </article>
      ))}
    </div>
  );
}

"use client";

import { Lock, Globe2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditEntryDialog } from "./edit-entry-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatShortDate } from "@/lib/format";
import type { CustomData } from "@/types/schema";

export function EntryCard({ entry }: { entry: CustomData }) {
  const paragraphs = entry.content.split("\n\n");

  return (
    <article className="group rounded-md border bg-surface p-5 transition-colors hover:border-border-strong sm:p-7">
      <header className="mb-4 flex items-start justify-between gap-4">
        <h2 className="min-w-0 wrap-break-word font-serif text-xl font-medium leading-tight text-ink sm:text-2xl">
          {entry.title}
        </h2>
        {/* Edit/delete actions are hidden until the card is hovered or focused -
            keeps the journal layout clean. focus-within keeps them visible
            while a dialog is open or a button is keyboard-focused. */}
        <div className="flex items-center gap-1 text-muted opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <EditEntryDialog
            trigger={
              <button
                type="button"
                className="rounded p-1.5 hover:bg-muted-bg hover:text-ink"
                aria-label="Edit entry"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            }
            defaultTitle={entry.title}
            defaultContent={entry.content}
            defaultIsPrivate={entry.isPrivate}
          />
          <ConfirmDialog
            trigger={
              <button
                type="button"
                className="rounded p-1.5 hover:bg-muted-bg hover:text-error"
                aria-label="Delete entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            }
            title="Delete this entry?"
            description="Once deleted, this note is gone. There is no undo."
            confirmLabel="Delete entry"
            variant="destructive"
            onConfirm={() => toast.success("Entry deleted")}
          />
        </div>
      </header>

      <div className="space-y-3 wrap-break-word text-[15px] leading-relaxed text-ink/90">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>

      <footer className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted">
        <span>{formatShortDate(entry.createdAt)}</span>
        <span>·</span>
        {entry.isPrivate ? (
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3 w-3" /> Private
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-accent">
            <Globe2 className="h-3 w-3" /> Public
          </span>
        )}
      </footer>
    </article>
  );
}

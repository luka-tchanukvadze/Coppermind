import { PageHeader } from "@/components/shared/page-header";
import { NewEntryDialog } from "@/components/shelf/new-entry-dialog";
import { EntryCard } from "@/components/shelf/entry-card";
import type { CustomData } from "@/types/schema";

export function UserBookEntries({ entries }: { entries: CustomData[] }) {
  return (
    <section>
      <PageHeader
        title="Entries"
        subtitle="Your thoughts, kept beside the book. Private ones stay yours."
        actions={<NewEntryDialog />}
        className="pb-4"
      />

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed py-16 text-center">
          <div className="font-serif text-lg text-ink">Nothing here yet.</div>
          <p className="mt-1 text-sm text-muted">Start a note, pin a quote, draft a question.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}

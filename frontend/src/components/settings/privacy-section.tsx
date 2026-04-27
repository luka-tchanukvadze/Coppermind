import { SectionHeader } from "./section-header";
import { SaveRow } from "./save-row";
import { PrivacyRow } from "./privacy-row";

export function PrivacySection() {
  return (
    <section>
      <SectionHeader
        title="Privacy defaults"
        description="These apply to new books and new entries. You can override per item."
      />
      <div className="divide-y">
        <PrivacyRow
          title="New books are private by default"
          description="When on, books you add to your shelf start hidden from friends."
          defaultChecked={false}
        />
        <PrivacyRow
          title="New entries are private by default"
          description="When on, notes you write about a book start private until you make them public."
          defaultChecked={true}
        />
      </div>
      <SaveRow />
    </section>
  );
}

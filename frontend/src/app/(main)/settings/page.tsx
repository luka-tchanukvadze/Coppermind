import { PageHeader } from "@/components/shared/page-header";
import { SettingsShell } from "@/components/settings/settings-shell";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Tune how Coppermind works for you." />
      <SettingsShell />
    </>
  );
}

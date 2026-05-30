import { Sidebar } from "@/components/shared/sidebar";
import { MainShell } from "@/components/shared/main-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <Sidebar />
      <MainShell>{children}</MainShell>
    </div>
  );
}

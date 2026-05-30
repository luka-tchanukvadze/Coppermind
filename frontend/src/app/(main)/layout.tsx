import { Sidebar } from "@/components/shared/sidebar";
import { MainShell } from "@/components/shared/main-shell";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="md:flex">
        <Sidebar />
        <MainShell>{children}</MainShell>
      </div>
    </AuthGuard>
  );
}

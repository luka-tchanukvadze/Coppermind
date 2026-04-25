import { Sidebar } from "@/components/shared/sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <MobileNav />
        <div className="mx-auto w-full max-w-300 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

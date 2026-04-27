import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen md:block">
      <SidebarNav />
    </aside>
  );
}

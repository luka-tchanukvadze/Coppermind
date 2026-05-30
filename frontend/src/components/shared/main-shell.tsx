"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/shared/mobile-nav";

// Wraps the authed app body. Chat needs a fixed full-height flex column (so the
// message list scrolls while the header/input stay pinned), every other page
// wants the normal padded, document-flow scroll. I branch on the route here so
// the shared (main) layout can stay a server component
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");

  if (isChat) {
    // h-dvh + flex col: MobileNav takes its natural height, the chat layout
    // (flex-1) fills the exact remaining space - no magic pixel offsets, so the
    // header can't scroll under the nav and the input stays glued to the bottom
    return (
      <main className="flex h-dvh min-w-0 flex-1 flex-col">
        <MobileNav />
        {children}
      </main>
    );
  }

  return (
    <main className="min-w-0 flex-1">
      <MobileNav />
      <div className="mx-auto w-full max-w-300 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        {children}
      </div>
    </main>
  );
}

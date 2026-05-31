"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/shared/mobile-nav";

// Wraps the authed app body. Chat needs a fixed full-height flex column (so the
// message list scrolls while the header/input stay pinned), every other page
// wants the normal padded, document-flow scroll. I branch on the route here so
// the shared (main) layout can stay a server component
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname.startsWith("/chat");

  // Lock the root scroller on chat routes. Without this, mobile browsers
  // retract the address bar by scrolling the document, and since the chat
  // header sits in normal flow it slides up under the sticky top nav while
  // MobileNav (sticky) stays put. Pinning <html> kills that body scroll so
  // only the message list moves. Lock <html> not <body> - MobileNav toggles
  // body overflow for its own drawer and would otherwise undo this on close.
  useEffect(() => {
    if (!isChat) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [isChat]);

  if (isChat) {
    // On mobile the shell is fixed to the viewport. Two reasons: (1) a fixed
    // box is sized to the layout viewport, which shrinks with the keyboard via
    // interactiveWidget, so header + list + input always fit and nothing
    // overflows. (2) fixed elements don't add to document scroll height and
    // can't be programmatically scrolled - so when the input is focused the
    // browser can't scroll the shell to follow it, which was pushing the top
    // nav out of view with no way to get it back. Desktop reverts to a normal
    // h-dvh flex child of the sidebar row.
    return (
      <main className="fixed inset-0 flex flex-col overflow-hidden bg-background md:static md:inset-auto md:h-dvh md:min-w-0 md:flex-1">
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

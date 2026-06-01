"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";
import { SidebarNav } from "./sidebar-nav";
import { useUnreadTotal } from "@/lib/api/conversations";
import { useUnseenRequestCount } from "@/lib/api/friends";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // the nav lives in the drawer on mobile, so surface a dot on the burger
  // itself for anything that needs attention (unread chat OR unseen friend
  // requests) - otherwise it'd be hidden until you open the drawer
  const unreadTotal = useUnreadTotal();
  const unseenRequests = useUnseenRequestCount();
  const hasAlert = unreadTotal > 0 || unseenRequests > 0;

  // Auto-close the drawer when the user navigates (otherwise it stays open
  // over the new page until they manually close it).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open so the page underneath doesn't move.
  // Cleanup runs on unmount too in case the component is removed mid-open.
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <Wordmark href="/feed" className="text-xl" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={hasAlert ? "Open menu (new notifications)" : "Open menu"}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-muted-bg"
        >
          <Menu className="h-5 w-5" />
          {hasAlert && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
          )}
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-nav-title"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="relative h-full w-65 animate-in slide-in-from-right-4 duration-200">
            {/* visually hidden but referenced by aria-labelledby so screen
                readers announce what this dialog is */}
            <h2 id="mobile-nav-title" className="sr-only">
              Navigation menu
            </h2>
            <SidebarNav onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-md bg-surface text-muted hover:bg-muted-bg hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

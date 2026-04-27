"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  BookOpenText,
  Users,
  MessageSquare,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Wordmark } from "./wordmark";
import { UserPic } from "./user-pic";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mocks/dummy";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Custom matcher because some routes share prefixes (e.g. /books vs /books/[id]).
  // Home uses exact match so it doesn't stay highlighted on every page.
  match?: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { href: "/feed", label: "Home", icon: Home, match: (p) => p === "/feed" },
  { href: "/books", label: "Books", icon: BookOpenText, match: (p) => p.startsWith("/books") },
  { href: "/shelf", label: "My Shelf", icon: Library, match: (p) => p.startsWith("/shelf") },
  { href: "/friends", label: "Friends", icon: Users, match: (p) => p.startsWith("/friends") },
  { href: "/chat", label: "Chat", icon: MessageSquare, match: (p) => p.startsWith("/chat") },
  { href: "/discussions", label: "Discussions", icon: Sparkles, match: (p) => p.startsWith("/discussions") },
];

// onNavigate fires after a Link click - used by MobileNav to close its drawer.
// Desktop sidebar doesn't need it.
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const me = currentUser();

  return (
    <div className="flex h-full w-65 shrink-0 flex-col border-r bg-surface/60">
      <div className="px-6 pt-7 pb-5">
        <Wordmark />
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "border-l-2 border-transparent",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "text-muted hover:bg-muted-bg hover:text-ink",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-md border bg-surface p-3">
        <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
          <UserPic photo={me.photo} name={me.name} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink">{me.name}</div>
            <div className="truncate text-xs text-muted">View profile</div>
          </div>
        </Link>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted-bg hover:text-ink"
          aria-label="Settings"
        >
          <Settings className="h-4.5 w-4.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

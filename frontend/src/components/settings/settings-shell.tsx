"use client";

import { useState } from "react";
import { User as UserIcon, Shield, AlertTriangle, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mocks/dummy";
import { AccountSection } from "./account-section";
import { ProfileSection } from "./profile-section";
import { PrivacySection } from "./privacy-section";
import { DangerSection } from "./danger-section";

type SectionId = "account" | "profile" | "privacy" | "danger";

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: NavItem[] = [
  { id: "account", label: "Account", icon: Mail },
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "privacy", label: "Privacy defaults", icon: Shield },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

export function SettingsShell() {
  const me = currentUser();
  const [section, setSection] = useState<SectionId>("account");

  return (
    <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <nav className="md:sticky md:top-10 md:self-start">
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:space-y-0.5 md:gap-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors md:w-full",
                    active
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:bg-muted-bg hover:text-ink",
                    s.id === "danger" && !active && "text-error/80",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        {section === "account" && <AccountSection email={me.email} />}
        {section === "profile" && <ProfileSection name={me.name} photo={me.photo} />}
        {section === "privacy" && <PrivacySection />}
        {section === "danger" && <DangerSection />}
      </div>
    </div>
  );
}

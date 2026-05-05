"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Shield,
  AlertTriangle,
  Mail,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSection } from "./account-section";
import { ProfileSection } from "./profile-section";
import { PrivacySection } from "./privacy-section";
import { DangerSection } from "./danger-section";
import { useMe } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const { data: user, isLoading, error } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [section, setSection] = useState<SectionId>("account");

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.push("/");
      },
      onError: (err) => toast.error(err.message),
    });
  };

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

          <li>
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors md:w-full hover:bg-muted-bg hover:text-ink text-error/80",
              )}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              {logout.isPending ? "Log out..." : "Log out"}
            </button>
          </li>
        </ul>
      </nav>

      <div className="min-w-0">
        {section === "account" && <AccountSection email={user?.email ?? ""} />}
        {section === "profile" && (
          <ProfileSection
            name={user?.name ?? ""}
            photo={user?.photo ?? "default.jpg"}
          />
        )}
        {section === "privacy" && <PrivacySection />}
        {section === "danger" && <DangerSection />}
      </div>
    </div>
  );
}

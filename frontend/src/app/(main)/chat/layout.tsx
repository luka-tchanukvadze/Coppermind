"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConversationListPane } from "./_components/conversation-list-pane";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // On mobile we show ONE pane at a time: list at /chat, room at /chat/[id].
  // On desktop both are always visible.
  const inConversation = pathname.startsWith("/chat/") && pathname !== "/chat";
  const activeConvoId = inConversation ? pathname.split("/")[2] : null;

  return (
    // Negative margins eat the (main) layout's px/py so chat fills edge-to-edge.
    // Mobile subtracts 57px because the MobileNav top bar is still visible there.
    // md+ has no top bar so we use the full dynamic viewport.
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-57px)] sm:-mx-6 sm:-my-8 md:-mx-8 md:-my-10 md:h-dvh">
      <ConversationListPane activeConvoId={activeConvoId} hideOnMobile={inConversation} />

      <section
        className={cn(
          "min-w-0 flex-1 flex-col",
          inConversation ? "flex" : "hidden md:flex",
        )}
      >
        {children}
      </section>
    </div>
  );
}

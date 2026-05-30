"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConversationListPane } from "./_components/conversation-list-pane";
import { useNewMessageSubscription } from "@/lib/socket/use-new-message-subscription";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNewMessageSubscription();
  const pathname = usePathname();
  // On mobile we show ONE pane at a time: list at /chat, room at /chat/[id].
  // On desktop both are always visible.
  const inConversation = pathname.startsWith("/chat/") && pathname !== "/chat";
  const activeConvoId = inConversation ? pathname.split("/")[2] : null;

  return (
    // MainShell gives a full-height flex column on chat routes (nav on top,
    // this fills the rest), so it just take the remaining space with flex-1.
    // min-h-0 lets the inner panes scroll instead of pushing the layout taller.
    <div className="flex min-h-0 flex-1">
      <ConversationListPane
        activeConvoId={activeConvoId}
        hideOnMobile={inConversation}
      />

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

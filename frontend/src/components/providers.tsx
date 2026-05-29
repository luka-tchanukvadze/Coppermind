"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query-client";
import { SocketProvider } from "@/lib/socket/socket-provider";
import { PresenceProvider } from "@/lib/presence/presence-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState so the client persists across renders but not across remounts
  const [client] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={client}>
      <SocketProvider>
        <PresenceProvider>{children}</PresenceProvider>
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

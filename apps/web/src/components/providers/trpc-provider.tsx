"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "../utils/trpc";
import React from "react";

const API_URL = `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "")}/api/trpc`;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // Subscriptions (playground streaming) travel over SSE; everything
        // else keeps using the batched HTTP link.
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: API_URL,
            transformer: superjson,
          }),
          false: httpBatchLink({
            url: API_URL,
            transformer: superjson,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

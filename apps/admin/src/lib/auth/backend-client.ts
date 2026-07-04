import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@agentrepo/trpc/schemas';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

/** Server-side tRPC client for the auth routes: talks to the API directly. */
export const backendTrpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_BASE}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

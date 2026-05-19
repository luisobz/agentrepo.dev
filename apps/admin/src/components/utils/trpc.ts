import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@agentrepo/trpc';

export const trpc = createTRPCReact<AppRouter>();

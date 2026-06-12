/**
 * Client-safe entry point: zod schemas and router types only.
 * Importing the package root pulls in `initTRPC` (server-only); client
 * components must import from `@agentrepo/trpc/schemas` instead.
 */
export * from './lib/schemas/catalog.schemas';
export type { AppRouter, RouterInputs, RouterOutputs } from './lib/routers/_app';

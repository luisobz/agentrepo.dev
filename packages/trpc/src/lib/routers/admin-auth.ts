import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

/**
 * Stateful admin session endpoints. The refresh token is opaque and stored
 * hashed server-side; callers (the admin Next.js app) keep both tokens in
 * HttpOnly cookies and never expose them to client-side JavaScript.
 */
export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.login.execute(input)),

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.refresh.execute(input.refreshToken)),

  logout: publicProcedure
    .input(z.object({ refreshToken: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.logout.execute(input.refreshToken)),
});

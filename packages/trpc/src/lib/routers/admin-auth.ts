import { z } from 'zod';
import { FixedWindowRateLimiter } from '../auth/login-rate-limit';
import { publicProcedure, rateLimit, router } from '../trpc';

// Backend-side safety net so brute force cannot bypass the BFF rate limiter by
// calling this procedure directly. Keyed by client IP at the trusted boundary.
const loginRateLimiter = new FixedWindowRateLimiter({
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
});

/**
 * Stateful admin session endpoints. The refresh token is opaque and stored
 * hashed server-side; callers (the admin Next.js app) keep both tokens in
 * HttpOnly cookies and never expose them to client-side JavaScript.
 */
export const adminAuthRouter = router({
  login: publicProcedure
    .use(rateLimit(loginRateLimiter, 'adminAuth.login'))
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.login.execute(input)),

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.refresh.execute(input.refreshToken)),

  logout: publicProcedure
    .input(z.object({ refreshToken: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.adminAuth.logout.execute(input.refreshToken)),
});

import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { FixedWindowRateLimiter } from '../auth/login-rate-limit';
const budget = new FixedWindowRateLimiter({
  maxAttempts: 60,
  windowMs: 3600000,
});
const repeat = new FixedWindowRateLimiter({
  maxAttempts: 1,
  windowMs: 3600000,
});
export const popularityRouter = router({
  trending: publicProcedure.query(
    ({ ctx }) => ctx.popularity?.list.execute() ?? [],
  ),
  recordView: publicProcedure
    .input(
      z.object({
        kind: z.enum(['skill', 'agent', 'blog']),
        slug: z
          .string()
          .min(1)
          .max(160)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clientIp || !ctx.popularity) return;
      if (
        !budget.consume(ctx.clientIp) ||
        !repeat.consume(`${ctx.clientIp}:${input.kind}:${input.slug}`)
      )
        return;
      await ctx.popularity.recordView(input.kind, input.slug);
    }),
});

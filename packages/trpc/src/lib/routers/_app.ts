import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const publicProcedure = t.procedure;
export const router = t.router;

const helloRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        text: `hello ${input?.name ?? 'world'}`,
      };
    }),
});

export const appRouter = router({
  hello: helloRouter,
});

export type AppRouter = typeof appRouter;

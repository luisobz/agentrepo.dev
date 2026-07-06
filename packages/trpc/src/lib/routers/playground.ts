import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { paginationSchema } from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

const tokenSchema = z.string().trim().min(8).max(128);
const promptSchema = z.string().trim().min(10).max(1_000);

export const createPlaygroundTokenSchema = z.object({
  label: z.string().trim().min(1).max(120),
  maxUses: z.number().int().min(1).max(100),
  expiresAt: z.coerce.date(),
});

export const playgroundRouter = router({
  /** Non-consuming validity check for the token entry field. */
  validateToken: publicProcedure
    .input(z.object({ token: tokenSchema }))
    .mutation(({ input, ctx }) => ctx.playground.checkToken.execute(input.token)),

  /**
   * Real agent flow over SSE. Consumes ONE token use per run (atomically),
   * then streams coder/tester/self-healing/review events as they happen.
   */
  executeFlow: publicProcedure
    .input(z.object({ token: tokenSchema, prompt: promptSchema }))
    .subscription(async function* ({ input, ctx }) {
      const consumed = await ctx.playground.consumeToken.execute(input.token);
      if (!consumed.valid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'The playground token is invalid, expired or exhausted',
        });
      }
      yield* ctx.playground.executeAgentFlow.execute({ prompt: input.prompt });
    }),

  /** Persists a reviewed feature with its fictitious subdomain URL. */
  deploy: publicProcedure
    .input(
      z.object({
        token: tokenSchema,
        title: z.string().trim().min(3).max(120),
        prompt: promptSchema,
        code: z.string().min(1).max(30_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const check = await ctx.playground.checkToken.execute(input.token);
      if (!check.valid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'The playground token is invalid, expired or exhausted',
        });
      }
      return ctx.playground.saveDeployment.execute({
        tokenId: null,
        title: input.title,
        prompt: input.prompt,
        code: input.code,
      });
    }),

  admin: router({
    list: adminProcedure
      .input(paginationSchema)
      .query(({ input, ctx }) => ctx.playground.listTokens.execute(input)),

    create: adminProcedure
      .input(createPlaygroundTokenSchema)
      .mutation(({ input, ctx }) => ctx.playground.createToken.execute(input)),

    setActive: adminProcedure
      .input(z.object({ id: z.uuid(), isActive: z.boolean() }))
      .mutation(({ input, ctx }) =>
        ctx.playground.setTokenActive.execute(input)
      ),

    delete: adminProcedure
      .input(z.object({ id: z.uuid() }))
      .mutation(({ input, ctx }) => ctx.playground.deleteToken.execute(input.id)),
  }),
});

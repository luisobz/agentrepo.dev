import { redactPremiumAgent } from '@agentrepo/domain';
import {
  adminListSchema,
  createAgentSchema,
  idInputSchema,
  paginationSchema,
  slugInputSchema,
  updateAgentSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const agentsRouter = router({
  list: publicProcedure
    .input(paginationSchema)
    .query(async ({ input, ctx }) => {
      const page = await ctx.catalog.agents.list.execute({
        ...input,
        publishedOnly: true,
      });
      return { ...page, items: page.items.map(redactPremiumAgent) };
    }),

  bySlug: publicProcedure
    .input(slugInputSchema)
    .query(async ({ input, ctx }) =>
      redactPremiumAgent(
        await ctx.catalog.agents.getPublishedBySlug.execute(input.slug)
      )
    ),

  admin: router({
    list: adminProcedure
      .input(adminListSchema)
      .query(({ input, ctx }) => ctx.catalog.agents.list.execute(input)),

    byId: adminProcedure
      .input(idInputSchema)
      .query(({ input, ctx }) => ctx.catalog.agents.getById.execute(input.id)),

    create: adminProcedure
      .input(createAgentSchema)
      .mutation(({ input, ctx }) => ctx.catalog.agents.create.execute(input)),

    update: adminProcedure
      .input(idInputSchema.extend({ data: updateAgentSchema }))
      .mutation(({ input, ctx }) => ctx.catalog.agents.update.execute(input)),

    delete: adminProcedure
      .input(idInputSchema)
      .mutation(({ input, ctx }) => ctx.catalog.agents.remove.execute(input.id)),
  }),
});

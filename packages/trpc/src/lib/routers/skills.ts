import { redactPremiumSkill } from '@agentrepo/domain';
import {
  adminListSchema,
  createSkillSchema,
  idInputSchema,
  paginationSchema,
  searchSkillsSchema,
  slugInputSchema,
  updateSkillSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const skillsRouter = router({
  list: publicProcedure
    .input(paginationSchema)
    .query(async ({ input, ctx }) => {
      const page = await ctx.catalog.skills.list.execute({
        ...input,
        publishedOnly: true,
      });
      return { ...page, items: page.items.map(redactPremiumSkill) };
    }),

  bySlug: publicProcedure
    .input(slugInputSchema)
    .query(async ({ input, ctx }) =>
      redactPremiumSkill(
        await ctx.catalog.skills.getPublishedBySlug.execute(input.slug)
      )
    ),

  search: publicProcedure
    .input(searchSkillsSchema)
    .query(async ({ input, ctx }) => {
      const page = await ctx.catalog.skills.searchPublished.execute(input);
      return { ...page, items: page.items.map(redactPremiumSkill) };
    }),

  admin: router({
    list: adminProcedure
      .input(adminListSchema)
      .query(({ input, ctx }) => ctx.catalog.skills.list.execute(input)),

    byId: adminProcedure
      .input(idInputSchema)
      .query(({ input, ctx }) => ctx.catalog.skills.getById.execute(input.id)),

    create: adminProcedure
      .input(createSkillSchema)
      .mutation(({ input, ctx }) => ctx.catalog.skills.create.execute(input)),

    update: adminProcedure
      .input(idInputSchema.extend({ data: updateSkillSchema }))
      .mutation(({ input, ctx }) => ctx.catalog.skills.update.execute(input)),

    delete: adminProcedure
      .input(idInputSchema)
      .mutation(({ input, ctx }) => ctx.catalog.skills.remove.execute(input.id)),
  }),
});

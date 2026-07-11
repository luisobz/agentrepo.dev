import { redactPremiumSkill } from '@agentrepo/domain';
import {
  adminListSchema,
  createSkillSchema,
  idInputSchema,
  paginationSchema,
  publishVersionSchema,
  recordDownloadSchema,
  searchSkillsSchema,
  setLatestVersionSchema,
  slugInputSchema,
  updateSkillSchema,
  versionParamsSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';
import { toVersionSummary } from './version-dto';

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

  /** Version history with download stats (metadata only, npm-style). */
  versions: publicProcedure
    .input(slugInputSchema)
    .query(async ({ input, ctx }) => {
      const entries = await ctx.catalog.skillVersions.listPublished.execute(
        input.slug
      );
      return entries.map(toVersionSummary);
    }),

  /** One pinned version; premium bodies stay behind the paywall. */
  byVersion: publicProcedure
    .input(versionParamsSchema)
    .query(async ({ input, ctx }) => {
      const [head, version] = await Promise.all([
        ctx.catalog.skills.getPublishedBySlug.execute(input.slug),
        ctx.catalog.skillVersions.getPublished.execute(input),
      ]);
      return head.isPremium
        ? { ...version, content: '', isLocked: true }
        : { ...version, isLocked: false };
    }),

  recordDownload: publicProcedure
    .input(recordDownloadSchema)
    .mutation(({ input, ctx }) =>
      ctx.catalog.skillVersions.recordDownload.execute(input)
    ),

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

    versions: adminProcedure
      .input(idInputSchema)
      .query(async ({ input, ctx }) => {
        const entries = await ctx.catalog.skillVersions.listForAdmin.execute(
          input.id
        );
        return entries.map(toVersionSummary);
      }),

    /** Snapshots the current draft content as a new version tagged latest. */
    publishVersion: adminProcedure
      .input(publishVersionSchema)
      .mutation(({ input, ctx }) =>
        ctx.catalog.skillVersions.publish.execute({
          assetId: input.id,
          version: input.version,
          changelog: input.changelog,
        })
      ),

    /** Retags latest (npm dist-tag style) to a previously published version. */
    setLatestVersion: adminProcedure
      .input(setLatestVersionSchema)
      .mutation(({ input, ctx }) =>
        ctx.catalog.skillVersions.setLatest.execute({
          assetId: input.id,
          versionId: input.versionId,
        })
      ),
  }),
});

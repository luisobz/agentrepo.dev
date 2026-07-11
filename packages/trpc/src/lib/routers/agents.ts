import { redactPremiumAgent } from '@agentrepo/domain';
import {
  adminListSchema,
  createAgentSchema,
  idInputSchema,
  paginationSchema,
  publishVersionSchema,
  recordDownloadSchema,
  setLatestVersionSchema,
  slugInputSchema,
  updateAgentSchema,
  versionParamsSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';
import { toVersionSummary } from './version-dto';

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

  /** Version history with download stats (metadata only, npm-style). */
  versions: publicProcedure
    .input(slugInputSchema)
    .query(async ({ input, ctx }) => {
      const entries = await ctx.catalog.agentVersions.listPublished.execute(
        input.slug
      );
      return entries.map(toVersionSummary);
    }),

  /** One pinned version; premium bodies stay behind the paywall. */
  byVersion: publicProcedure
    .input(versionParamsSchema)
    .query(async ({ input, ctx }) => {
      const [head, version] = await Promise.all([
        ctx.catalog.agents.getPublishedBySlug.execute(input.slug),
        ctx.catalog.agentVersions.getPublished.execute(input),
      ]);
      return head.isPremium
        ? { ...version, fileTree: [], readmeContent: null, isLocked: true }
        : { ...version, isLocked: false };
    }),

  recordDownload: publicProcedure
    .input(recordDownloadSchema)
    .mutation(({ input, ctx }) =>
      ctx.catalog.agentVersions.recordDownload.execute(input)
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

    versions: adminProcedure
      .input(idInputSchema)
      .query(async ({ input, ctx }) => {
        const entries = await ctx.catalog.agentVersions.listForAdmin.execute(
          input.id
        );
        return entries.map(toVersionSummary);
      }),

    /** Snapshots the current draft (README + file tree) as a new version. */
    publishVersion: adminProcedure
      .input(publishVersionSchema)
      .mutation(({ input, ctx }) =>
        ctx.catalog.agentVersions.publish.execute({
          assetId: input.id,
          version: input.version,
          changelog: input.changelog,
        })
      ),

    /** Retags latest (npm dist-tag style) to a previously published version. */
    setLatestVersion: adminProcedure
      .input(setLatestVersionSchema)
      .mutation(({ input, ctx }) =>
        ctx.catalog.agentVersions.setLatest.execute({
          assetId: input.id,
          versionId: input.versionId,
        })
      ),
  }),
});

import { localizeBlogPost } from '@agentrepo/domain';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { paginationSchema, idInputSchema } from '../schemas/catalog.schemas';
import { publicProcedure, router } from '../trpc';
import { postSummary } from './catalog-summary';

// Mutations keep provider tokens out of URLs and public GET caches, including
// for these read-only operations. Identity and the local admin role are verified
// independently on every call; a UI flag or cookie claim is never sufficient.
const reviewProcedure = publicProcedure
  .input(z.object({ token: z.string().min(1).max(16384) }))
  .use(async ({ ctx, input, next }) => {
    if (!(await ctx.adminAuth.checkAccess.execute(input.token)))
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Admin session required',
      });
    return next();
  });

export const blogReviewRouter = router({
  list: reviewProcedure
    .input(paginationSchema)
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.catalog.blogPosts.list.execute({
        page: input.page,
        pageSize: input.pageSize,
        orderBy: 'createdAt',
        unpublishedOnly: true,
      });
      return {
        ...page,
        items: page.items.map((post) =>
          postSummary(localizeBlogPost(post, input.locale)),
        ),
      };
    }),
  byId: reviewProcedure
    .input(idInputSchema.extend({ locale: z.enum(['es', 'en']).optional() }))
    .mutation(async ({ ctx, input }) =>
      localizeBlogPost(
        await ctx.catalog.blogPosts.getById.execute(input.id),
        input.locale,
      ),
    ),
  publish: reviewProcedure
    .input(idInputSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.catalog.blogPosts.update.execute({
        id: input.id,
        data: { isPublished: true },
      });
      return { slug: post.slug };
    }),
});

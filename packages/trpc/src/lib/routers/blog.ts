import { paginationSchema, slugInputSchema } from '../schemas/catalog.schemas';
import { publicProcedure, router } from '../trpc';

/**
 * Public reading API for the blog. Returns published posts only, ordered by
 * publication date (newest first) for the editorial listing.
 */
export const blogRouter = router({
  getPosts: publicProcedure
    .input(paginationSchema)
    .query(({ input, ctx }) =>
      ctx.catalog.blogPosts.list.execute({
        ...input,
        publishedOnly: true,
        orderBy: 'createdAt',
      })
    ),

  getPostBySlug: publicProcedure
    .input(slugInputSchema)
    .query(({ input, ctx }) =>
      ctx.catalog.blogPosts.getPublishedBySlug.execute(input.slug)
    ),
});

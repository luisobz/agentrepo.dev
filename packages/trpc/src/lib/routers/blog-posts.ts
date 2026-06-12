import {
  adminListSchema,
  createBlogPostSchema,
  idInputSchema,
  paginationSchema,
  slugInputSchema,
  updateBlogPostSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const blogPostsRouter = router({
  list: publicProcedure
    .input(paginationSchema)
    .query(({ input, ctx }) =>
      ctx.catalog.blogPosts.list.execute({ ...input, publishedOnly: true })
    ),

  bySlug: publicProcedure
    .input(slugInputSchema)
    .query(({ input, ctx }) =>
      ctx.catalog.blogPosts.getPublishedBySlug.execute(input.slug)
    ),

  admin: router({
    list: adminProcedure
      .input(adminListSchema)
      .query(({ input, ctx }) => ctx.catalog.blogPosts.list.execute(input)),

    byId: adminProcedure
      .input(idInputSchema)
      .query(({ input, ctx }) => ctx.catalog.blogPosts.getById.execute(input.id)),

    create: adminProcedure
      .input(createBlogPostSchema)
      .mutation(({ input, ctx }) => ctx.catalog.blogPosts.create.execute(input)),

    update: adminProcedure
      .input(idInputSchema.extend({ data: updateBlogPostSchema }))
      .mutation(({ input, ctx }) => ctx.catalog.blogPosts.update.execute(input)),

    delete: adminProcedure
      .input(idInputSchema)
      .mutation(({ input, ctx }) =>
        ctx.catalog.blogPosts.remove.execute(input.id)
      ),
  }),
});

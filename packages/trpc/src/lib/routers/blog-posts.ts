import {
  adminListSchema,
  createBlogPostSchema,
  idInputSchema,
  updateBlogPostSchema,
} from '../schemas/catalog.schemas';
import { adminProcedure, router } from '../trpc';

/**
 * Admin-only blog CRUD. Public reads live in `blogRouter` (`blog.getPosts` /
 * `blog.getPostBySlug`); this router intentionally exposes no public surface.
 */
export const blogPostsRouter = router({
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

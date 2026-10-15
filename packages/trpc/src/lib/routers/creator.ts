import { TRPCError } from '@trpc/server';
import { buildAgentFileTree } from '@agentrepo/domain';
import { FixedWindowRateLimiter } from '../auth/login-rate-limit';
import { creatorProcedure, router } from '../trpc';
import {
  submitAgentSchema,
  submitSkillSchema,
  submitBlogSchema,
} from '../schemas/creator.schemas';

const submitLimiter = new FixedWindowRateLimiter({
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000,
});

const moderatedCreatorProcedure = creatorProcedure.use(({ ctx, next }) => {
  // The web proxy shares an IP; budget drafts by the verified contributor instead.
  if (!submitLimiter.consume('creator:' + ctx.creatorUserId))
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Draft limit reached; try again later',
    });
  return next();
});

export const creatorRouter = router({
  submitBlog: moderatedCreatorProcedure
    .input(submitBlogSchema)
    .mutation(({ input, ctx }) =>
      ctx.catalog.blogPosts.create.execute({
        ...input,
        excerpt: input.excerpt || null,
        authorId: ctx.creatorUserId,
        isPublished: false,
        headerImageUrl: null,
      }),
    ),
  submitSkill: moderatedCreatorProcedure
    .input(submitSkillSchema)
    .mutation(({ input, ctx }) =>
      ctx.catalog.skills.create.execute({
        ...input,
        description: input.description || null,
        authorId: ctx.creatorUserId,
        isPublished: false,
        headerImageUrl: null,
        isPremium: false,
        priceCents: null,
        currency: 'EUR',
        previewContent: null,
      }),
    ),
  submitAgent: moderatedCreatorProcedure
    .input(submitAgentSchema)
    .mutation(({ input, ctx }) => {
      const { files, ...metadata } = input;
      return ctx.catalog.agents.create.execute({
        ...metadata,
        fileTree: buildAgentFileTree(files ?? [], input.readmeContent),
        authorId: ctx.creatorUserId,
        version: '1.0.0',
        isPublished: false,
        headerImageUrl: null,
        isPremium: false,
        priceCents: null,
        currency: 'EUR',
        previewContent: null,
      });
    }),
});

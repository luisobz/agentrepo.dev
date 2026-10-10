import { FixedWindowRateLimiter } from '../auth/login-rate-limit';
import { creatorProcedure, rateLimit, router } from '../trpc';
import { submitAgentSchema, submitSkillSchema } from '../schemas/creator.schemas';

const submitLimiter = new FixedWindowRateLimiter({ maxAttempts: 10, windowMs: 60 * 60 * 1000 });

export const creatorRouter = router({
  submitSkill: creatorProcedure
    .use(rateLimit(submitLimiter, 'submit-skill'))
    .input(submitSkillSchema)
    .mutation(({ input, ctx }) => ctx.catalog.skills.create.execute({
      ...input,
      description: input.description || null,
      authorId: ctx.creatorUserId,
      isPublished: false,
      headerImageUrl: null,
      isPremium: false,
      priceCents: null,
      currency: 'EUR',
      previewContent: null,
    })),
  submitAgent: creatorProcedure
    .use(rateLimit(submitLimiter, 'submit-agent'))
    .input(submitAgentSchema)
    .mutation(({ input, ctx }) => ctx.catalog.agents.create.execute({
      ...input,
      fileTree: [{ name: 'README.md', type: 'file' as const, content: input.readmeContent }],
      authorId: ctx.creatorUserId,
      version: '1.0.0',
      isPublished: false,
      headerImageUrl: null,
      isPremium: false,
      priceCents: null,
      currency: 'EUR',
      previewContent: null,
    })),
});

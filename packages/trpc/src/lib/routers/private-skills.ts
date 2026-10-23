import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  idInputSchema,
  paginationSchema,
  slugSchema,
} from '../schemas/catalog.schemas';
import { publicProcedure, router } from '../trpc';
import type { PrivateSkill } from '@agentrepo/domain';

const documentSchema = z.object({
  slug: slugSchema.max(80),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).nullable().default(null),
  content: z.string().min(1).max(100000),
});

const ownerProcedure = publicProcedure
  .input(z.object({ token: z.string().min(1).max(16384) }))
  .use(async ({ ctx, input, next }) => {
    const identity = await ctx.adminAuth.resolveIdentity.execute(input.token);
    if (!identity)
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Administrator sign-in required',
      });
    if (!ctx.privateSkills)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Private skills unavailable',
      });
    return next({
      ctx: {
        privateSkillOwnerId: identity.id,
        privateSkills: ctx.privateSkills,
      },
    });
  });

function documentView(skill: PrivateSkill) {
  const { ownerId: _owner, ...document } = skill;
  return document;
}

// Private documents never enter Skill/SkillVersion, public search or the CLI registry.
// POST keeps provider credentials out of URLs, including for read operations.
export const privateSkillsRouter = router({
  list: ownerProcedure
    .input(paginationSchema)
    .mutation(({ ctx, input }) =>
      ctx.privateSkills.list.execute({
        ownerId: ctx.privateSkillOwnerId,
        page: input.page,
        pageSize: input.pageSize,
      }),
    ),
  byId: ownerProcedure
    .input(idInputSchema)
    .mutation(async ({ ctx, input }) =>
      documentView(
        await ctx.privateSkills.getById.execute({
          ownerId: ctx.privateSkillOwnerId,
          id: input.id,
        }),
      ),
    ),
  create: ownerProcedure
    .input(documentSchema)
    .mutation(async ({ ctx, input }) =>
      documentView(
        await ctx.privateSkills.create.execute({
          ownerId: ctx.privateSkillOwnerId,
          data: documentSchema.parse(input),
        }),
      ),
    ),
  update: ownerProcedure
    .input(
      idInputSchema.extend({
        revision: z.number().int().min(1),
        data: documentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) =>
      documentView(
        await ctx.privateSkills.update.execute({
          ownerId: ctx.privateSkillOwnerId,
          id: input.id,
          revision: input.revision,
          data: input.data,
        }),
      ),
    ),
});

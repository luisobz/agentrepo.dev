import { CONTACT_REQUEST_STATUSES, CONTACT_SUBJECTS } from '@agentrepo/domain';
import { z } from 'zod';
import { paginationSchema } from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const submitContactSchema = z.object({
  email: z.email().max(320),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(10).max(5_000),
});

export const listContactRequestsSchema = paginationSchema.extend({
  status: z.enum(CONTACT_REQUEST_STATUSES).optional(),
});

export const contactRouter = router({
  submit: publicProcedure
    .input(submitContactSchema)
    .mutation(({ input, ctx }) => ctx.portfolio.submitContact.execute(input)),

  admin: router({
    list: adminProcedure
      .input(listContactRequestsSchema)
      .query(({ input, ctx }) =>
        ctx.portfolio.listContactRequests.execute(input)
      ),
  }),
});

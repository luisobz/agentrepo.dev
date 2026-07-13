import { CONTACT_REQUEST_STATUSES, CONTACT_SUBJECTS } from '@agentrepo/domain';
import { z } from 'zod';
import { FixedWindowRateLimiter } from '../auth/login-rate-limit';
import { paginationSchema } from '../schemas/catalog.schemas';
import { adminProcedure, publicProcedure, rateLimit, router } from '../trpc';

// Each submission triggers a paid LLM call plus outbound emails, so cap it
// per client IP to prevent cost abuse and email relay to arbitrary addresses.
const contactRateLimiter = new FixedWindowRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

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
    .use(rateLimit(contactRateLimiter, 'contact.submit'))
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

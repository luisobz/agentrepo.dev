import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const globalSearchSchema = z.object({
  query: z.string().trim().max(200),
  limitPerType: z.number().int().min(1).max(20).default(5),
});

const MIN_QUERY_LENGTH = 2;

/** Global full-text search (Postgres) across published Skills, Agents and posts. */
export const searchRouter = router({
  global: publicProcedure
    .input(globalSearchSchema)
    .query(({ input, ctx }) => {
      if (input.query.length < MIN_QUERY_LENGTH) {
        return [];
      }
      return ctx.globalSearch.execute(input);
    }),
});

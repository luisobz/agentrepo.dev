import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { agentsRouter } from "./agents";
import { blogRouter } from "./blog";
import { blogPostsRouter } from "./blog-posts";
import { searchRouter } from "./search";
import { skillsRouter } from "./skills";

const helloRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        text: `hello ${input?.name ?? "world"}`,
      };
    }),
});

export const appRouter = router({
  hello: helloRouter,
  search: searchRouter,
  skills: skillsRouter,
  agents: agentsRouter,
  blogPosts: blogPostsRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

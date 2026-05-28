import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

export interface TRPCContext {
  prisma: PrismaClient;
}

// We share the same t builder or initialize context-typed one
const t = initTRPC.context<TRPCContext>().create();
const publicProcedure = t.procedure;

export const searchRouter = t.router({
  global: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const query = input.query.trim();
      if (!query) {
        return [];
      }

      // Query database tables in parallel with search filters
      const [skills, agents, posts] = await Promise.all([
        ctx.prisma.skill.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
        }),
        ctx.prisma.agent.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { shortDescription: { contains: query, mode: "insensitive" } },
              { readmeContent: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
        }),
        ctx.prisma.blogPost.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
        }),
      ]);

      const results = [
        ...skills.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          description: s.description || "",
          type: "skill" as const,
          badge: s.type, // e.g. "prompt", "system", etc.
        })),
        ...agents.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          description: a.shortDescription || "",
          type: "agent" as const,
          badge: a.version,
        })),
        ...posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.excerpt || "",
          type: "blog" as const,
        })),
      ];

      return results;
    }),
});

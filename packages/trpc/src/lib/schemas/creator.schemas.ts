import { z } from 'zod';
import {
  AGENT_FILE_LIMITS,
  validateAgentFiles,
  withAgentReadme,
} from '@agentrepo/domain';
export {
  AGENT_FILE_LIMITS,
  validateAgentFiles,
  validateAgentPath,
  withAgentReadme,
  InvalidAgentFilesError,
} from '@agentrepo/domain';
export type { AgentSourceFile } from '@agentrepo/domain';
import {
  skillTypeSchema,
  slugSchema,
  repositoryUrlSchema,
  relatedLinksSchema,
} from './catalog.schemas';

export const submitSkillSchema = z.object({
  relatedLinks: relatedLinksSchema.default([]),
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).default(''),
  content: z
    .string()
    .trim()
    .min(1)
    .max(100_000)
    .refine(
      (content) =>
        validateAgentFiles([{ path: 'content.md', content }]) === null,
      'Use UTF-8 text up to 100 KB without binary control characters',
    ),
  type: skillTypeSchema,
});

export const agentSourceFilesSchema = z
  .array(
    z
      .object({ path: z.string().max(512), content: z.string().max(100_000) })
      .strict(),
  )
  .max(AGENT_FILE_LIMITS.files);

export const submitAgentSchema = z
  .object({
    files: agentSourceFilesSchema.optional(),
    relatedLinks: relatedLinksSchema.default([]),
    slug: slugSchema,
    title: z.string().trim().min(1).max(200),
    shortDescription: z.string().trim().min(1).max(300),
    readmeContent: z.string().trim().min(1).max(100_000),
    repositoryUrl: repositoryUrlSchema.nullable().default(null),
  })
  .superRefine((value, ctx) => {
    const problem =
      validateAgentFiles(value.files ?? []) ??
      validateAgentFiles(
        withAgentReadme(value.files ?? [], value.readmeContent),
      );
    if (problem)
      ctx.addIssue({ code: 'custom', message: problem, path: ['files'] });
  });

export const submitBlogSchema = z.object({
  relatedLinks: relatedLinksSchema.default([]),
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).default(''),
  content: z
    .string()
    .trim()
    .min(1)
    .max(100_000)
    .refine(
      (content) =>
        validateAgentFiles([{ path: 'content.md', content }]) === null,
      'Use UTF-8 text up to 100 KB without binary control characters',
    ),
});

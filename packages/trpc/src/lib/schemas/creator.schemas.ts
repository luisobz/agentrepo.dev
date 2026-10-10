import { z } from 'zod';
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
  content: z.string().trim().min(1).max(100_000),
  type: skillTypeSchema,
});

export const submitAgentSchema = z.object({
  relatedLinks: relatedLinksSchema.default([]),
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().min(1).max(300),
  readmeContent: z.string().trim().min(1).max(100_000),
  repositoryUrl: repositoryUrlSchema.nullable().default(null),
});

export const submitBlogSchema = z.object({
  relatedLinks: relatedLinksSchema.default([]),
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).default(''),
  content: z.string().trim().min(1).max(100_000),
});

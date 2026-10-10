import { z } from 'zod';
import { skillTypeSchema, slugSchema } from './catalog.schemas';

export const submitSkillSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).default(''),
  content: z.string().trim().min(1).max(100_000),
  type: skillTypeSchema,
});

export const submitAgentSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().min(1).max(300),
  readmeContent: z.string().trim().min(1).max(100_000),
});

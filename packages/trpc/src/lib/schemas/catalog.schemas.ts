import { FileTreeNode, SKILL_TYPES } from '@agentrepo/domain';
import { z } from 'zod';

export { SKILL_TYPES } from '@agentrepo/domain';
export type { FileTree, FileTreeNode, SkillType } from '@agentrepo/domain';

// ─── Shared ─────────────────────────────────────

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const adminListSchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const idInputSchema = z.object({ id: z.uuid() });
export const slugInputSchema = z.object({ slug: slugSchema });

// ─── Skill ──────────────────────────────────────

export const skillTypeSchema = z.enum(SKILL_TYPES);

// Base schemas hold no defaults: defaults belong to creation only. Reusing
// them in updates would silently reset fields omitted from a partial patch.
const skillBaseSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).nullable(),
  content: z.string().min(1, 'Markdown content is required'),
  type: skillTypeSchema,
  isPublished: z.boolean(),
});

export const createSkillSchema = skillBaseSchema.extend({
  description: skillBaseSchema.shape.description.default(null),
  isPublished: z.boolean().default(false),
});

export const updateSkillSchema = skillBaseSchema.partial();

export const searchSkillsSchema = paginationSchema.extend({
  query: z.string().trim().min(1).max(200),
});

// ─── Agent ──────────────────────────────────────

const nodeNameSchema = z.string().trim().min(1).max(255);

export const fileTreeNodeSchema: z.ZodType<FileTreeNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      name: nodeNameSchema,
      type: z.literal('file'),
      content: z.string(),
    }),
    z.object({
      name: nodeNameSchema,
      type: z.literal('directory'),
      children: z.array(fileTreeNodeSchema),
    }),
  ])
);

export const fileTreeSchema = z.array(fileTreeNodeSchema);

const agentBaseSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().min(1).max(300),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Use semantic versioning (e.g. 1.0.0)'),
  readmeContent: z.string().nullable(),
  fileTree: fileTreeSchema,
  isPublished: z.boolean(),
});

export const createAgentSchema = agentBaseSchema.extend({
  version: agentBaseSchema.shape.version.default('1.0.0'),
  readmeContent: agentBaseSchema.shape.readmeContent.default(null),
  isPublished: z.boolean().default(false),
});

export const updateAgentSchema = agentBaseSchema.partial();

// ─── BlogPost ───────────────────────────────────

const blogPostBaseSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).nullable(),
  content: z.string().min(1, 'Markdown content is required'),
  isPublished: z.boolean(),
});

export const createBlogPostSchema = blogPostBaseSchema.extend({
  excerpt: blogPostBaseSchema.shape.excerpt.default(null),
  isPublished: z.boolean().default(false),
});

export const updateBlogPostSchema = blogPostBaseSchema.partial();

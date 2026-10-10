import {
  FileTreeNode,
  SKILL_TYPES,
  RELATED_LINK_KINDS,
  isPublicReferenceUrl,
} from '@agentrepo/domain';
import { z } from 'zod';

export {
  CONTACT_REQUEST_STATUSES,
  CONTACT_SUBJECTS,
  SKILL_TYPES,
} from '@agentrepo/domain';
export type {
  ContactRequestStatus,
  ContactSubject,
  FileTree,
  FileTreeNode,
  SkillType,
} from '@agentrepo/domain';

export const relatedLinkSchema = z
  .object({
    kind: z.enum(RELATED_LINK_KINDS),
    label: z.string().trim().min(1).max(100),
    url: z
      .string()
      .trim()
      .max(1000)
      .refine(isPublicReferenceUrl, 'Use a public HTTPS URL'),
  })
  .superRefine((link, ctx) => {
    if (!isPublicReferenceUrl(link.url)) return;
    const host = new URL(link.url).hostname.toLowerCase();
    const expected =
      link.kind === 'github'
        ? ['github.com', 'www.github.com']
        : link.kind === 'x'
          ? ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']
          : null;
    if (expected && !expected.includes(host))
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: `Use a ${link.kind} URL or choose another link type`,
      });
  });
export const relatedLinksSchema = z
  .array(relatedLinkSchema)
  .max(12)
  .refine(
    (links) =>
      new Set(links.map((link) => link.url.replace(/\/$/, ''))).size ===
      links.length,
    'Each URL can only appear once',
  );
export type RelatedLink = z.infer<typeof relatedLinkSchema>;

// ─── Shared ─────────────────────────────────────

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and hyphens',
  );

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const adminListSchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  pendingReviewOnly: z.boolean().optional(),
});

export const idInputSchema = z.object({ id: z.uuid() });
export const slugInputSchema = z.object({ slug: slugSchema });

// ─── Versioning (npm-style registry) ────────────

export const semverSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Use semantic versioning (e.g. 1.0.0)');

export const versionParamsSchema = z.object({
  slug: slugSchema,
  version: semverSchema,
});

export const recordDownloadSchema = z.object({
  slug: slugSchema,
  version: semverSchema.optional(),
});

export const publishVersionSchema = z.object({
  id: z.uuid(),
  version: semverSchema,
  changelog: z.string().trim().min(1).max(2_000).nullable().default(null),
});

export const setLatestVersionSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
});

export const currencySchema = z.enum(['EUR', 'USD']);

const premiumFieldsSchema = {
  headerImageUrl: z.url().max(500).nullable(),
  isPremium: z.boolean(),
  priceCents: z.number().int().min(100).max(10_000_000).nullable(),
  currency: currencySchema,
  previewContent: z.string().max(10_000).nullable(),
};

export const repositoryUrlSchema = z
  .url()
  .max(500)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  }, 'Use a public HTTPS repository URL');

function requirePriceWhenPremium(
  value: { isPremium?: boolean; priceCents?: number | null },
  ctx: z.RefinementCtx,
) {
  if (value.isPremium && value.priceCents == null) {
    ctx.addIssue({
      code: 'custom',
      path: ['priceCents'],
      message: 'Premium assets need a price',
    });
  }
}

// ─── Skill ──────────────────────────────────────

export const skillTypeSchema = z.enum(SKILL_TYPES);

// Base schemas hold no defaults: defaults belong to creation only. Reusing
// them in updates would silently reset fields omitted from a partial patch.
const skillBaseSchema = z.object({
  relatedLinks: relatedLinksSchema,
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).nullable(),
  content: z.string().min(1, 'Markdown content is required'),
  type: skillTypeSchema,
  isPublished: z.boolean(),
  ...premiumFieldsSchema,
});

export const createSkillSchema = skillBaseSchema
  .extend({
    relatedLinks: relatedLinksSchema.default([]),
    description: skillBaseSchema.shape.description.default(null),
    isPublished: z.boolean().default(false),
    headerImageUrl: premiumFieldsSchema.headerImageUrl.default(null),
    isPremium: z.boolean().default(false),
    priceCents: premiumFieldsSchema.priceCents.default(null),
    currency: currencySchema.default('EUR'),
    previewContent: premiumFieldsSchema.previewContent.default(null),
  })
  .superRefine(requirePriceWhenPremium);

export const updateSkillSchema = skillBaseSchema
  .partial()
  .superRefine(requirePriceWhenPremium);

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
  ]),
);

export const fileTreeSchema = z.array(fileTreeNodeSchema);

const agentBaseSchema = z.object({
  relatedLinks: relatedLinksSchema,
  repositoryUrl: repositoryUrlSchema.nullable().optional(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().min(1).max(300),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Use semantic versioning (e.g. 1.0.0)'),
  readmeContent: z.string().nullable(),
  fileTree: fileTreeSchema,
  isPublished: z.boolean(),
  ...premiumFieldsSchema,
});

export const createAgentSchema = agentBaseSchema
  .extend({
    relatedLinks: relatedLinksSchema.default([]),
    version: agentBaseSchema.shape.version.default('1.0.0'),
    readmeContent: agentBaseSchema.shape.readmeContent.default(null),
    isPublished: z.boolean().default(false),
    headerImageUrl: premiumFieldsSchema.headerImageUrl.default(null),
    isPremium: z.boolean().default(false),
    priceCents: premiumFieldsSchema.priceCents.default(null),
    currency: currencySchema.default('EUR'),
    previewContent: premiumFieldsSchema.previewContent.default(null),
  })
  .superRefine(requirePriceWhenPremium);

export const updateAgentSchema = agentBaseSchema
  .partial()
  .superRefine(requirePriceWhenPremium);

// ─── BlogPost ───────────────────────────────────

const blogPostBaseSchema = z.object({
  relatedLinks: relatedLinksSchema,
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).nullable(),
  content: z.string().min(1, 'Markdown content is required'),
  isPublished: z.boolean(),
  headerImageUrl: z.url().max(500).nullable(),
});

export const createBlogPostSchema = blogPostBaseSchema.extend({
  relatedLinks: relatedLinksSchema.default([]),
  excerpt: blogPostBaseSchema.shape.excerpt.default(null),
  isPublished: z.boolean().default(false),
  headerImageUrl: blogPostBaseSchema.shape.headerImageUrl.default(null),
});

export const updateBlogPostSchema = blogPostBaseSchema.partial();

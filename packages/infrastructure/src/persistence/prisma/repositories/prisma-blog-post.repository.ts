import {
  BlogPostRepository,
  CreateBlogPostInput,
  ListContentParams,
  Paginated,
  UpdateBlogPostInput,
} from '@agentrepo/application';
import { BlogPost, relatedLinksFromJson } from '@agentrepo/domain';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaBlogPostRepository implements BlogPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: ListContentParams): Promise<Paginated<BlogPost>> {
    const where: Prisma.BlogPostWhereInput = {
      ...(params.publishedOnly ? { isPublished: true } : {}),
      ...(params.pendingReviewOnly ? { isPublished: false } : {}),
      ...(params.authorId
        ? { authorId: params.authorId }
        : params.pendingReviewOnly
          ? { authorId: { not: null } }
          : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { slug: { contains: params.search, mode: 'insensitive' } },
              { excerpt: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy:
          params.orderBy === 'createdAt'
            ? { createdAt: 'desc' }
            : { updatedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items: items.map((row) => ({
        ...row,
        relatedLinks: relatedLinksFromJson(row.relatedLinks),
        authorName: row.author?.name ?? null,
      })),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findById(id: string): Promise<BlogPost | null> {
    const row = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
    return row
      ? {
          ...row,
          relatedLinks: relatedLinksFromJson(row.relatedLinks),
          authorName: row.author?.name ?? null,
        }
      : null;
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    const row = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
    return row
      ? {
          ...row,
          relatedLinks: relatedLinksFromJson(row.relatedLinks),
          authorName: row.author?.name ?? null,
        }
      : null;
  }

  async existsSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.blogPost.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }

  async create(data: CreateBlogPostInput): Promise<BlogPost> {
    const row = await this.prisma.blogPost.create({ data });
    return { ...row, relatedLinks: relatedLinksFromJson(row.relatedLinks) };
  }

  async update(id: string, data: UpdateBlogPostInput): Promise<BlogPost> {
    const row = await this.prisma.blogPost.update({ where: { id }, data });
    return { ...row, relatedLinks: relatedLinksFromJson(row.relatedLinks) };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blogPost.delete({ where: { id } });
  }
}

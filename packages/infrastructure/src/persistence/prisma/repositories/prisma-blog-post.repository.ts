import {
  BlogPostRepository,
  CreateBlogPostInput,
  ListContentParams,
  Paginated,
  UpdateBlogPostInput,
} from '@agentrepo/application';
import { BlogPost } from '@agentrepo/domain';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaBlogPostRepository implements BlogPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: ListContentParams): Promise<Paginated<BlogPost>> {
    const where: Prisma.BlogPostWhereInput = {
      ...(params.publishedOnly ? { isPublished: true } : {}),
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        orderBy:
          params.orderBy === 'createdAt'
            ? { createdAt: 'desc' }
            : { updatedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  findById(id: string): Promise<BlogPost | null> {
    return this.prisma.blogPost.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<BlogPost | null> {
    return this.prisma.blogPost.findUnique({ where: { slug } });
  }

  async existsSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.blogPost.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }

  create(data: CreateBlogPostInput): Promise<BlogPost> {
    return this.prisma.blogPost.create({ data });
  }

  update(id: string, data: UpdateBlogPostInput): Promise<BlogPost> {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blogPost.delete({ where: { id } });
  }
}

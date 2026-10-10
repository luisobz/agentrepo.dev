import { BlogPost } from '@agentrepo/domain';
import { ContentRepository } from './content.repository';

export type CreateBlogPostInput = Omit<
  BlogPost,
  'id' | 'createdAt' | 'updatedAt' | 'authorName'
>;
export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export type BlogPostRepository = ContentRepository<
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput
>;

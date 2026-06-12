import { Agent, BlogPost, Skill } from '@agentrepo/domain';
import { UseCase } from '../shared/base.use-case';
import { AgentRepository, CreateAgentInput, UpdateAgentInput } from './ports/agent.repository';
import {
  BlogPostRepository,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './ports/blog-post.repository';
import {
  ContentRecord,
  ContentRepository,
  ListContentParams,
  Paginated,
} from './ports/content.repository';
import {
  CreateSkillInput,
  SearchSkillsParams,
  SkillRepository,
  UpdateSkillInput,
} from './ports/skill.repository';
import {
  CreateContent,
  DeleteContent,
  GetContentById,
  GetPublishedContentBySlug,
  ListContent,
  UpdateContent,
  UpdateContentRequest,
} from './use-cases/content.use-cases';
import { SearchPublishedSkills } from './use-cases/search-skills.use-case';

export interface ContentUseCases<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> {
  list: UseCase<ListContentParams, Paginated<TModel>>;
  getById: UseCase<string, TModel>;
  getPublishedBySlug: UseCase<string, TModel>;
  create: UseCase<TCreate, TModel>;
  update: UseCase<UpdateContentRequest<TUpdate>, TModel>;
  remove: UseCase<string, void>;
}

export interface SkillUseCases
  extends ContentUseCases<Skill, CreateSkillInput, UpdateSkillInput> {
  searchPublished: UseCase<SearchSkillsParams, Paginated<Skill>>;
}

export type AgentUseCases = ContentUseCases<
  Agent,
  CreateAgentInput,
  UpdateAgentInput
>;

export type BlogPostUseCases = ContentUseCases<
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput
>;

export interface CatalogUseCases {
  skills: SkillUseCases;
  agents: AgentUseCases;
  blogPosts: BlogPostUseCases;
}

export interface CatalogRepositories {
  skillRepository: SkillRepository;
  agentRepository: AgentRepository;
  blogPostRepository: BlogPostRepository;
}

function createContentUseCases<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
>(
  repository: ContentRepository<TModel, TCreate, TUpdate>,
  entityName: string
): ContentUseCases<TModel, TCreate, TUpdate> {
  return {
    list: new ListContent(repository),
    getById: new GetContentById(repository, entityName),
    getPublishedBySlug: new GetPublishedContentBySlug(repository, entityName),
    create: new CreateContent(repository, entityName),
    update: new UpdateContent(repository, entityName),
    remove: new DeleteContent(repository, entityName),
  };
}

export function createCatalogUseCases({
  skillRepository,
  agentRepository,
  blogPostRepository,
}: CatalogRepositories): CatalogUseCases {
  return {
    skills: {
      ...createContentUseCases(skillRepository, 'Skill'),
      searchPublished: new SearchPublishedSkills(skillRepository),
    },
    agents: createContentUseCases(agentRepository, 'Agent'),
    blogPosts: createContentUseCases(blogPostRepository, 'BlogPost'),
  };
}

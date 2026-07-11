import {
  Agent,
  AgentVersion,
  BlogPost,
  Skill,
  SkillVersion,
  VersionListEntry,
} from '@agentrepo/domain';
import { UseCase } from '../shared/base.use-case';
import type {
  AgentVersionRepository,
  AssetVersionRepository,
  PublishVersionInput,
  RecordDownloadInput,
  SetLatestVersionInput,
  SkillVersionRepository,
} from './ports/asset-version.repository';
import {
  GetPublishedAssetVersion,
  GetPublishedVersionParams,
  ListAssetVersionsForAdmin,
  ListPublishedAssetVersions,
  PublishAssetVersion,
  RecordAssetDownload,
  SetLatestAssetVersion,
} from './use-cases/asset-version.use-cases';
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

/** npm-style version registry operations for one asset kind. */
export interface AssetVersionUseCases<TVersion> {
  listForAdmin: UseCase<string, VersionListEntry<TVersion>[]>;
  listPublished: UseCase<string, VersionListEntry<TVersion>[]>;
  getPublished: UseCase<GetPublishedVersionParams, TVersion>;
  publish: UseCase<PublishVersionInput, TVersion>;
  setLatest: UseCase<SetLatestVersionInput, TVersion>;
  recordDownload: UseCase<RecordDownloadInput, void>;
}

export interface CatalogUseCases {
  skills: SkillUseCases;
  agents: AgentUseCases;
  blogPosts: BlogPostUseCases;
  skillVersions: AssetVersionUseCases<SkillVersion>;
  agentVersions: AssetVersionUseCases<AgentVersion>;
}

export interface CatalogRepositories {
  skillRepository: SkillRepository;
  agentRepository: AgentRepository;
  blogPostRepository: BlogPostRepository;
  skillVersionRepository: SkillVersionRepository;
  agentVersionRepository: AgentVersionRepository;
}

function createAssetVersionUseCases<TVersion>(
  repository: AssetVersionRepository<TVersion>,
  entityName: string
): AssetVersionUseCases<TVersion> {
  return {
    listForAdmin: new ListAssetVersionsForAdmin(repository),
    listPublished: new ListPublishedAssetVersions(repository, entityName),
    getPublished: new GetPublishedAssetVersion(repository, entityName),
    publish: new PublishAssetVersion(repository),
    setLatest: new SetLatestAssetVersion(repository),
    recordDownload: new RecordAssetDownload(repository),
  };
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
  skillVersionRepository,
  agentVersionRepository,
}: CatalogRepositories): CatalogUseCases {
  return {
    skills: {
      ...createContentUseCases(skillRepository, 'Skill'),
      searchPublished: new SearchPublishedSkills(skillRepository),
    },
    agents: createContentUseCases(agentRepository, 'Agent'),
    blogPosts: createContentUseCases(blogPostRepository, 'BlogPost'),
    skillVersions: createAssetVersionUseCases(skillVersionRepository, 'Skill'),
    agentVersions: createAssetVersionUseCases(agentVersionRepository, 'Agent'),
  };
}

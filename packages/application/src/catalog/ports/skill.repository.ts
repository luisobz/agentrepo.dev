import { Skill } from '@agentrepo/domain';
import {
  ContentRepository,
  ListContentParams,
  Paginated,
} from './content.repository';

export type CreateSkillInput = Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSkillInput = Partial<CreateSkillInput>;

export interface SearchSkillsParams {
  query: string;
  page: number;
  pageSize: number;
}

export interface SkillRepository
  extends ContentRepository<Skill, CreateSkillInput, UpdateSkillInput> {
  /** Full-text search over published skills. */
  searchPublished(params: SearchSkillsParams): Promise<Paginated<Skill>>;
}

export type ListSkillsParams = ListContentParams;

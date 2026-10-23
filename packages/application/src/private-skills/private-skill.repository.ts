import type {
  PrivateSkill,
  PrivateSkillData,
  PrivateSkillSummary,
} from '@agentrepo/domain';
import type { Paginated } from '../catalog/ports/content.repository';

export interface PrivateSkillRepository {
  listOwned(
    ownerId: string,
    page: { page: number; pageSize: number },
  ): Promise<Paginated<PrivateSkillSummary>>;
  findOwned(ownerId: string, id: string): Promise<PrivateSkill | null>;
  createOwned(ownerId: string, data: PrivateSkillData): Promise<PrivateSkill>;
  updateOwned(
    ownerId: string,
    id: string,
    revision: number,
    data: PrivateSkillData,
  ): Promise<PrivateSkill | null>;
}

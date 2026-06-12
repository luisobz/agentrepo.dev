import { Skill } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import { Paginated } from '../ports/content.repository';
import { SearchSkillsParams, SkillRepository } from '../ports/skill.repository';

export class SearchPublishedSkills
  implements UseCase<SearchSkillsParams, Paginated<Skill>>
{
  constructor(private readonly repository: SkillRepository) {}

  execute(params: SearchSkillsParams): Promise<Paginated<Skill>> {
    return this.repository.searchPublished(params);
  }
}

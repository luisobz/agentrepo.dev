import { SearchHit } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import {
  GlobalSearchParams,
  GlobalSearchRepository,
} from '../ports/global-search.repository';

export class SearchCatalog implements UseCase<GlobalSearchParams, SearchHit[]> {
  constructor(private readonly repository: GlobalSearchRepository) {}

  execute(params: GlobalSearchParams): Promise<SearchHit[]> {
    return this.repository.searchPublished(params);
  }
}

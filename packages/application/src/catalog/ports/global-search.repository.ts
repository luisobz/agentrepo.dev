import { SearchHit } from '@agentrepo/domain';

export interface GlobalSearchParams {
  query: string;
  /** Maximum number of hits returned per content type. */
  limitPerType: number;
}

export interface GlobalSearchRepository {
  searchPublished(params: GlobalSearchParams): Promise<SearchHit[]>;
}

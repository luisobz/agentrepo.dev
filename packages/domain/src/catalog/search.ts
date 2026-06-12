export type SearchHitType = 'skill' | 'agent' | 'blog';

export interface SearchHit {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: SearchHitType;
  badge?: string;
}

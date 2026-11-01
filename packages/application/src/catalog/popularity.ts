import type { UseCase } from '../shared/base.use-case';
export type PopularityKind = 'skill' | 'agent' | 'blog';
export interface ContentSignal {
  kind: PopularityKind;
  slug: string;
  views: number;
  downloads: number;
}
export interface PopularityRepository {
  recent(since: Date): Promise<ContentSignal[]>;
  recordView(kind: PopularityKind, slug: string): Promise<void>;
}
export class ListTrendingContent
  implements UseCase<void, (ContentSignal & { score: number })[]>
{
  constructor(private readonly repository: PopularityRepository) {}
  async execute() {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - 6);
    return (await this.repository.recent(since))
      .map((row) => ({ ...row, score: row.views + row.downloads * 3 }))
      .filter((row) => row.views + row.downloads >= 3)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.kind.localeCompare(b.kind) ||
          a.slug.localeCompare(b.slug),
      )
      .slice(0, 6);
  }
}

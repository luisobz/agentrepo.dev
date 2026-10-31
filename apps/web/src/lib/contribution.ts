export type ContributionKind = 'skill' | 'agent' | 'blog';

export function contributionKind(value: unknown): ContributionKind | undefined {
  return value === 'skill' || value === 'agent' || value === 'blog'
    ? value
    : undefined;
}

export function contributionHref(kind?: ContributionKind): string {
  return kind ? `/creator?type=${kind}` : '/creator';
}

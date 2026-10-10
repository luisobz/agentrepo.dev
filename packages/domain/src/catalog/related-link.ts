import { DataIntegrityError } from '../errors/domain.error';

export const RELATED_LINK_KINDS = [
  'website',
  'github',
  'x',
  'documentation',
  'community',
  'video',
  'other',
] as const;
export type RelatedLink = {
  kind: (typeof RELATED_LINK_KINDS)[number];
  label: string;
  url: string;
};

export function isPublicReferenceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      host.includes('.') &&
      !host.endsWith('.localhost') &&
      !host.endsWith('.local') &&
      !/^\d+(\.\d+){3}$/.test(host) &&
      !host.includes(':')
    );
  } catch {
    return false;
  }
}

function isRelatedLink(value: unknown): value is RelatedLink {
  if (!value || typeof value !== 'object') return false;
  return (
    'kind' in value &&
    typeof value.kind === 'string' &&
    RELATED_LINK_KINDS.some((kind) => kind === value.kind) &&
    'label' in value &&
    typeof value.label === 'string' &&
    'url' in value &&
    typeof value.url === 'string' &&
    isPublicReferenceUrl(value.url)
  );
}

export function relatedLinksFromJson(value: unknown): RelatedLink[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || !value.every(isRelatedLink)) {
    throw new DataIntegrityError('Content has malformed related links');
  }
  return value;
}

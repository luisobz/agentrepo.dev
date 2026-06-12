/**
 * Mocked "Latest" feed for the home page. Swap for a tRPC-backed feed once
 * there is enough published content to power it.
 */
export interface LatestItem {
  id: string;
  type: 'skill' | 'agent' | 'blog';
  title: string;
  description: string;
  href: string;
  badge?: 'prompt' | 'system' | 'config' | 'template' | string;
  date: string;
}

export const LATEST_ITEMS: LatestItem[] = [
  {
    id: 'latest-1',
    type: 'skill',
    title: 'Code review checklist',
    description: 'A structured prompt that reviews pull requests for bugs, naming and tests.',
    href: '/skills',
    badge: 'prompt',
    date: '2026-06-09',
  },
  {
    id: 'latest-2',
    type: 'agent',
    title: 'Release notes agent',
    description: 'Reads merged PRs and drafts human-friendly release notes.',
    href: '/agents',
    badge: 'v1.2.0',
    date: '2026-06-07',
  },
  {
    id: 'latest-3',
    type: 'blog',
    title: 'Structured agents beat ad hoc prompts',
    description: 'Why validation and versioning make AI agents reliable in production.',
    href: '/blog',
    date: '2026-06-05',
  },
  {
    id: 'latest-4',
    type: 'skill',
    title: 'Strict TypeScript system prompt',
    description: 'System instructions that keep generated code type-safe and idiomatic.',
    href: '/skills',
    badge: 'system',
    date: '2026-06-03',
  },
  {
    id: 'latest-5',
    type: 'skill',
    title: 'Monorepo config template',
    description: 'Opinionated Nx + pnpm workspace settings for AI-assisted teams.',
    href: '/skills',
    badge: 'template',
    date: '2026-05-30',
  },
  {
    id: 'latest-6',
    type: 'agent',
    title: 'Docs gardener',
    description: 'Keeps READMEs in sync with the code they describe.',
    href: '/agents',
    badge: 'v0.9.1',
    date: '2026-05-27',
  },
];

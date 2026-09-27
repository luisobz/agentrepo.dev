import type { WebDictionaryKey } from '../../lib/i18n/dictionary';

export const PLAYGROUND_COLUMNS = [
  'backlog',
  'develop',
  'testing',
  'review',
  'documentation',
] as const;

export type PlaygroundColumnId = (typeof PLAYGROUND_COLUMNS)[number];

/** Dictionary keys for each column's label, resolved via useT()/getServerT(). */
export const COLUMN_LABEL_KEYS: Record<PlaygroundColumnId, WebDictionaryKey> = {
  backlog: 'playground.column.backlog',
  develop: 'playground.column.develop',
  testing: 'playground.column.testing',
  review: 'playground.column.review',
  documentation: 'playground.column.documentation',
};

export const DOCUMENTATION_LIBRARIES = [
  'Outline',
  'Obsidian',
  'Notion',
] as const;
export type DocumentationLibrary = (typeof DOCUMENTATION_LIBRARIES)[number];

export type PlaygroundAgent = 'coder' | 'tester' | 'documenter' | 'deployer';

export const AGENT_LABELS: Record<PlaygroundAgent, string> = {
  coder: 'CoderAgent',
  tester: 'TesterAgent',
  documenter: 'DocsAgent',
  deployer: 'DeployerAgent',
};

export interface PlaygroundSubtask {
  label: string;
  done: boolean;
}

export type MockPreviewId =
  | 'dark-hero'
  | 'oauth-flow'
  | 'redis-cache'
  | 'search-palette';

export interface PlaygroundCardData {
  id: string;
  title: string;
  column: PlaygroundColumnId;
  subtasks: PlaygroundSubtask[];
  agent?: PlaygroundAgent;
  hasError?: boolean;
  errorDetail?: string;
  isDeploying?: boolean;
  isDeployed?: boolean;
  documentationLibrary?: DocumentationLibrary;
  screenshotCount?: number;
  isMerged?: boolean;
  releaseTag?: string;
  deployedUrl?: string;
  /** Mock cards render a canned preview; real cards carry generated code. */
  kind: 'mock' | 'real';
  previewId?: MockPreviewId;
  prompt?: string;
  code?: string;
  summary?: string;
}

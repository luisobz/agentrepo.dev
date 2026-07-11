import type { WebDictionaryKey } from '../../lib/i18n/dictionary';

export const PLAYGROUND_COLUMNS = [
  'backlog',
  'develop',
  'testing',
  'review',
  'deploy',
] as const;

export type PlaygroundColumnId = (typeof PLAYGROUND_COLUMNS)[number];

/** Dictionary keys for each column's label, resolved via useT()/getServerT(). */
export const COLUMN_LABEL_KEYS: Record<PlaygroundColumnId, WebDictionaryKey> = {
  backlog: 'playground.column.backlog',
  develop: 'playground.column.develop',
  testing: 'playground.column.testing',
  review: 'playground.column.review',
  deploy: 'playground.column.deploy',
};

export type PlaygroundAgent = 'coder' | 'tester' | 'deployer';

export const AGENT_LABELS: Record<PlaygroundAgent, string> = {
  coder: 'CoderAgent',
  tester: 'TesterAgent',
  deployer: 'DeployerAgent',
};

export interface PlaygroundSubtask {
  label: string;
  done: boolean;
}

export type MockPreviewId = 'dark-hero' | 'oauth-flow' | 'redis-cache';

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
  deployedUrl?: string;
  /** Mock cards render a canned preview; real cards carry generated code. */
  kind: 'mock' | 'real';
  previewId?: MockPreviewId;
  prompt?: string;
  code?: string;
  summary?: string;
}

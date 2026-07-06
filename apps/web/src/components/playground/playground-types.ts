export const PLAYGROUND_COLUMNS = [
  'backlog',
  'develop',
  'testing',
  'review',
  'deploy',
] as const;

export type PlaygroundColumnId = (typeof PLAYGROUND_COLUMNS)[number];

export const COLUMN_LABELS: Record<PlaygroundColumnId, string> = {
  backlog: 'Backlog',
  develop: 'Desarrollar',
  testing: 'Testing',
  review: 'Review',
  deploy: 'Deploy',
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

import type { PlaygroundDeployment } from '@agentrepo/domain';

export interface CreatePlaygroundDeploymentInput {
  tokenId: string | null;
  title: string;
  prompt: string;
  code: string;
  url: string;
}

export interface PlaygroundDeploymentRepository {
  create(input: CreatePlaygroundDeploymentInput): Promise<PlaygroundDeployment>;
}

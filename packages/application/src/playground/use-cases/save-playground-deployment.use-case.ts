import type { PlaygroundDeployment } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import type { PlaygroundDeploymentRepository } from '../ports/playground-deployment.repository';

export interface SavePlaygroundDeploymentRequest {
  tokenId: string | null;
  title: string;
  prompt: string;
  code: string;
}

function toSubdomainSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'playground-feature';
}

export class SavePlaygroundDeployment
  implements UseCase<SavePlaygroundDeploymentRequest, PlaygroundDeployment>
{
  constructor(private readonly deployments: PlaygroundDeploymentRepository) {}

  execute(
    request: SavePlaygroundDeploymentRequest
  ): Promise<PlaygroundDeployment> {
    return this.deployments.create({
      ...request,
      url: `https://${toSubdomainSlug(request.title)}.agentrepo.dev`,
    });
  }
}

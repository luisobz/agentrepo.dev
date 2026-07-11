import {
  CreatePlaygroundDeploymentInput,
  PlaygroundDeploymentRepository,
} from '@agentrepo/application';
import { PlaygroundDeployment } from '@agentrepo/domain';
import { PrismaClient } from '@prisma/client';

export class PrismaPlaygroundDeploymentRepository
  implements PlaygroundDeploymentRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  create(input: CreatePlaygroundDeploymentInput): Promise<PlaygroundDeployment> {
    return this.prisma.playgroundDeployment.create({ data: input });
  }
}

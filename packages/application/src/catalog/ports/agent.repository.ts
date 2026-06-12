import { Agent } from '@agentrepo/domain';
import { ContentRepository } from './content.repository';

export type CreateAgentInput = Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAgentInput = Partial<CreateAgentInput>;

export type AgentRepository = ContentRepository<
  Agent,
  CreateAgentInput,
  UpdateAgentInput
>;

import { Agent } from '@agentrepo/domain';
import { ContentRepository } from './content.repository';

export type CreateAgentInput = Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'> & { authorId?: string | null };
export type UpdateAgentInput = Partial<CreateAgentInput>;

export type AgentRepository = ContentRepository<
  Agent,
  CreateAgentInput,
  UpdateAgentInput
>;

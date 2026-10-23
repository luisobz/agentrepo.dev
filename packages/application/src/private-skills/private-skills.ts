import {
  EntityNotFoundError,
  InvalidCredentialsError,
  RevisionConflictError,
} from '@agentrepo/domain';
import type { PrivateSkillData } from '@agentrepo/domain';
import type { PrivateSkillRepository } from './private-skill.repository';

function ownedRequest<T extends { ownerId: string }>(input?: T): T {
  if (!input?.ownerId) throw new InvalidCredentialsError();
  return input;
}

export function createPrivateSkillUseCases(repository: PrivateSkillRepository) {
  return {
    list: {
      execute: async (input?: {
        ownerId: string;
        page: number;
        pageSize: number;
      }) => {
        const { ownerId, page, pageSize } = ownedRequest(input);
        return repository.listOwned(ownerId, { page, pageSize });
      },
    },
    getById: {
      execute: async (input?: { ownerId: string; id: string }) => {
        const { ownerId, id } = ownedRequest(input);
        const skill = await repository.findOwned(ownerId, id);
        if (!skill) throw new EntityNotFoundError('Private skill', id);
        return skill;
      },
    },
    create: {
      execute: async (input?: { ownerId: string; data: PrivateSkillData }) => {
        const { ownerId, data } = ownedRequest(input);
        return repository.createOwned(ownerId, data);
      },
    },
    update: {
      execute: async (input?: {
        ownerId: string;
        id: string;
        revision: number;
        data: PrivateSkillData;
      }) => {
        const { ownerId, id, revision, data } = ownedRequest(input);
        const skill = await repository.updateOwned(ownerId, id, revision, data);
        if (skill) return skill;
        if (await repository.findOwned(ownerId, id))
          throw new RevisionConflictError();
        throw new EntityNotFoundError('Private skill', id);
      },
    },
  };
}

export type PrivateSkillUseCases = ReturnType<
  typeof createPrivateSkillUseCases
>;

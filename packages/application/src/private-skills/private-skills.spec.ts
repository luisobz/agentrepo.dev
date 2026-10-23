import { expect, it, vi } from 'vitest';
import { createPrivateSkillUseCases } from './private-skills';
import type { PrivateSkill } from '@agentrepo/domain';
import type { PrivateSkillRepository } from './private-skill.repository';

function setup() {
  const repository = {
    listOwned: vi.fn(async () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    })),
    findOwned: vi.fn<PrivateSkillRepository['findOwned']>(async () => null),
    createOwned: vi.fn(),
    updateOwned: vi.fn(async () => null),
  } satisfies PrivateSkillRepository;
  return { repository, cases: createPrivateSkillUseCases(repository) };
}

it('requires an owner before any private lookup', async () => {
  const { repository, cases } = setup();
  await expect(
    cases.list.execute({ ownerId: '', page: 1, pageSize: 20 }),
  ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  expect(repository.listOwned).not.toHaveBeenCalled();
});

it('scopes every lookup to the authenticated owner and hides missing or foreign records', async () => {
  const { repository, cases } = setup();
  await expect(
    cases.getById.execute({ ownerId: 'owner-b', id: 'owned-by-a' }),
  ).rejects.toMatchObject({ code: 'ENTITY_NOT_FOUND' });
  expect(repository.findOwned).toHaveBeenCalledWith('owner-b', 'owned-by-a');
});

it('does not create a record as fallback when an owned update misses', async () => {
  const { repository, cases } = setup();
  await expect(
    cases.update.execute({
      ownerId: 'owner-b',
      id: 'owned-by-a',
      revision: 1,
      data: {
        slug: 'example',
        title: 'Example',
        description: null,
        content: 'Private text',
      },
    }),
  ).rejects.toMatchObject({ code: 'ENTITY_NOT_FOUND' });
  expect(repository.createOwned).not.toHaveBeenCalled();
});

it('reports a stale revision only for documents belonging to the verified owner', async () => {
  const { repository, cases } = setup();
  const document: PrivateSkill = {
    id: 'owned-id',
    ownerId: 'owner-a',
    slug: 'example',
    title: 'Example',
    description: null,
    content: 'Synthetic fixture',
    revision: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  repository.findOwned.mockResolvedValue(document);
  await expect(
    cases.update.execute({
      ownerId: 'owner-a',
      id: document.id,
      revision: 1,
      data: document,
    }),
  ).rejects.toMatchObject({ code: 'REVISION_CONFLICT' });
  expect(repository.findOwned).toHaveBeenCalledWith('owner-a', document.id);
  expect(repository.createOwned).not.toHaveBeenCalled();
});

import type { PrismaClient } from '@prisma/client';
import { expect, it, vi } from 'vitest';
import { PrismaPrivateSkillRepository } from './prisma-private-skill.repository';
const data = {
  slug: 'example',
  title: 'Example',
  description: null,
  content: 'Synthetic test document',
};
function setup() {
  const db = {
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    findFirst: vi.fn(async () => null),
    create: vi.fn(),
    updateMany: vi.fn(async () => ({ count: 0 })),
  };
  return {
    db,
    repository: new PrismaPrivateSkillRepository({
      privateSkill: db,
    } as unknown as PrismaClient),
  };
}
it('constrains both list and count to the owner and excludes document bodies', async () => {
  const { db, repository } = setup();
  await repository.listOwned('owner-a', { page: 2, pageSize: 10 });
  expect(db.count).toHaveBeenCalledWith({ where: { ownerId: 'owner-a' } });
  expect(db.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { ownerId: 'owner-a' },
      skip: 10,
      take: 10,
      select: expect.not.objectContaining({ content: true, ownerId: true }),
    }),
  );
});
it('never looks up a document without its owner', async () => {
  const { db, repository } = setup();
  await repository.findOwned('owner-b', 'private-id');
  expect(db.findFirst).toHaveBeenCalledWith({
    where: { id: 'private-id', ownerId: 'owner-b' },
  });
});
it('uses compare-and-swap with owner, id and revision; misses do not read or create', async () => {
  const { db, repository } = setup();
  expect(
    await repository.updateOwned('owner-b', 'private-id', 7, data),
  ).toBeNull();
  expect(db.updateMany).toHaveBeenCalledWith({
    where: { id: 'private-id', ownerId: 'owner-b', revision: 7 },
    data: { ...data, revision: { increment: 1 } },
  });
  expect(db.findFirst).not.toHaveBeenCalled();
  expect(db.create).not.toHaveBeenCalled();
});
it('persists only permitted document fields and forces the verified owner', async () => {
  const { db, repository } = setup();
  await repository.createOwned('owner-a', {
    ...data,
    ownerId: 'victim',
    token: 'must-not-persist',
  } as typeof data);
  expect(db.create).toHaveBeenCalledWith({
    data: { ...data, ownerId: 'owner-a' },
  });
});

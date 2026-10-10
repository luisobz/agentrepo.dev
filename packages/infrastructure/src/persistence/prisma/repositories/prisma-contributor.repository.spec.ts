import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaContributorRepository } from './prisma-contributor.repository';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: 'postgresql://test:test@localhost/test',
  }),
});
const repository = new PrismaContributorRepository(prisma);
const identity = {
  providerUserId: 'provider-user',
  email: 'member@example.test',
  name: 'Member',
  provider: 'github' as const,
};
const user = {
  id: 'local-user',
  supabaseId: identity.providerUserId,
  email: identity.email,
  name: 'Member',
  avatarUrl: null,
  provider: 'github',
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => vi.restoreAllMocks());

describe('contributor account ownership', () => {
  it('recognises the stable provider identity without relinking by email', async () => {
    const find = vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
    const create = vi.spyOn(prisma.user, 'create');
    expect(await repository.findOrCreate(identity)).toBe(user.id);
    expect(find).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses to take over an existing account with the same email', async () => {
    vi.spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...user, supabaseId: 'another-provider-user' });
    const create = vi.spyOn(prisma.user, 'create');
    expect(await repository.findOrCreate(identity)).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('provisions only the member role for a verified new identity', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const create = vi.spyOn(prisma.user, 'create').mockResolvedValue(user);
    expect(await repository.findOrCreate(identity)).toBe(user.id);
    expect(create).toHaveBeenCalledWith({
      data: {
        supabaseId: identity.providerUserId,
        email: identity.email,
        name: identity.name,
        provider: 'github',
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'member' },
                create: { name: 'member' },
              },
            },
          },
        },
      },
    });
  });

  it('resolves concurrent provisioning only by the same provider identity', async () => {
    const find = vi
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);
    vi.spyOn(prisma.user, 'create').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate identity', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    expect(await repository.findOrCreate(identity)).toBe(user.id);
    expect(find).toHaveBeenLastCalledWith({
      where: { supabaseId: identity.providerUserId },
    });
  });
});

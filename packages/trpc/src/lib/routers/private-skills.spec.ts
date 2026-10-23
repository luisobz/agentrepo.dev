import { expect, it, vi } from 'vitest';
import type { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const id = '11111111-1111-4111-8111-111111111111';
const data = {
  slug: 'private-example',
  title: 'Private example',
  description: null,
  content: 'Synthetic private fixture',
};
function setup(owner: string | null) {
  const list = vi.fn(async () => ({ items: [], total: 0 }));
  const get = vi.fn(async () => ({ ...data, id, ownerId: owner, revision: 1 }));
  const create = vi.fn(async () => ({
    ...data,
    id,
    ownerId: owner,
    revision: 1,
  }));
  const update = vi.fn(async () => ({
    ...data,
    id,
    ownerId: owner,
    revision: 2,
  }));
  const identity = vi.fn(async () => (owner ? { id: owner } : null));
  const caller = appRouter.createCaller({
    isAdmin: true,
    clientIp: '127.0.0.1',
    adminAuth: { resolveIdentity: { execute: identity } },
    privateSkills: {
      list: { execute: list },
      getById: { execute: get },
      create: { execute: create },
      update: { execute: update },
    },
  } as unknown as TRPCContext);
  return { caller, list, get, create, update };
}

it('rejects all private operations without a verified linked provider identity, even with a legacy admin session', async () => {
  const { caller, list, get, create, update } = setup(null);
  for (const call of [
    () => caller.privateSkills.list({ token: 'untrusted' }),
    () => caller.privateSkills.byId({ token: 'untrusted', id }),
    () => caller.privateSkills.create({ token: 'untrusted', ...data }),
    () =>
      caller.privateSkills.update({
        token: 'untrusted',
        id,
        revision: 1,
        data,
      }),
  ])
    await expect(call()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  for (const operation of [list, get, create, update])
    expect(operation).not.toHaveBeenCalled();
});

it('derives ownership server-side and strips submitted owner fields from saved data', async () => {
  const { caller, create } = setup('verified-owner');
  const result = await caller.privateSkills.create({
    token: 'verified',
    ...data,
    ownerId: 'victim-owner',
  } as Parameters<typeof caller.privateSkills.create>[0]);
  expect(create).toHaveBeenCalledWith({ ownerId: 'verified-owner', data });
  expect(result).not.toHaveProperty('ownerId');
});

it('forwards the verified owner and revision for reads and writes', async () => {
  const { caller, get, update } = setup('owner-b');
  await caller.privateSkills.byId({ token: 'verified', id });
  await caller.privateSkills.update({
    token: 'verified',
    id,
    revision: 3,
    data,
  });
  expect(get).toHaveBeenCalledWith({ ownerId: 'owner-b', id });
  expect(update).toHaveBeenCalledWith({
    ownerId: 'owner-b',
    id,
    revision: 3,
    data,
  });
});

it('rejects oversized documents and invalid slugs without invoking storage', async () => {
  const { caller, create } = setup('verified-owner');
  await expect(
    caller.privateSkills.create({
      token: 'verified',
      ...data,
      content: 'x'.repeat(100001),
    }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  await expect(
    caller.privateSkills.create({
      token: 'verified',
      ...data,
      slug: '../public',
    }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  expect(create).not.toHaveBeenCalled();
});

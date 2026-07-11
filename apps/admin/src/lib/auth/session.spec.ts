import { verifySessionToken } from '@agentrepo/trpc/auth';
import { cookies } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_ACCESS_COOKIE } from './constants';
import { hasValidAdminSession } from './session';

vi.mock('@agentrepo/trpc/auth', () => ({ verifySessionToken: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

const verifyMock = vi.mocked(verifySessionToken);
const cookiesMock = vi.mocked(cookies);

function mockCookies(store: Record<string, string>): void {
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name in store ? { name, value: store[name] } : undefined,
  } as unknown as Awaited<ReturnType<typeof cookies>>);
}

describe('hasValidAdminSession', () => {
  const original = process.env.AUTH_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AUTH_SECRET;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = original;
    }
  });

  it('returns false and does not verify when AUTH_SECRET is unset', async () => {
    delete process.env.AUTH_SECRET;
    mockCookies({ [ADMIN_ACCESS_COOKIE]: 'token' });

    await expect(hasValidAdminSession()).resolves.toBe(false);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('returns whatever verifySessionToken resolves when the secret is set', async () => {
    process.env.AUTH_SECRET = 'secret';
    mockCookies({ [ADMIN_ACCESS_COOKIE]: 'token' });
    verifyMock.mockResolvedValue(true);

    await expect(hasValidAdminSession()).resolves.toBe(true);

    verifyMock.mockResolvedValue(false);
    await expect(hasValidAdminSession()).resolves.toBe(false);
  });

  it('passes the access cookie value and the secret to verifySessionToken', async () => {
    process.env.AUTH_SECRET = 'the-secret';
    mockCookies({ [ADMIN_ACCESS_COOKIE]: 'the-access-token' });
    verifyMock.mockResolvedValue(true);

    await hasValidAdminSession();

    expect(verifyMock).toHaveBeenCalledWith('the-access-token', 'the-secret');
  });

  it('passes undefined to verifySessionToken when the access cookie is absent', async () => {
    process.env.AUTH_SECRET = 'the-secret';
    mockCookies({});
    verifyMock.mockResolvedValue(false);

    await hasValidAdminSession();

    expect(verifyMock).toHaveBeenCalledWith(undefined, 'the-secret');
  });
});

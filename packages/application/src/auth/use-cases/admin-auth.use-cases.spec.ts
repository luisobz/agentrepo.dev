import { AdminSession, InvalidCredentialsError, InvalidRefreshTokenError } from '@agentrepo/domain';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminSessionRepository,
  CreateAdminSessionInput,
} from '../ports/admin-session.repository';
import { AdminUser, AdminUserRepository } from '../ports/admin-user.repository';
import { PasswordAuthenticator } from '../ports/password-authenticator';
import { AdminAuthUseCases, createAdminAuthUseCases } from './admin-auth.use-cases';

class InMemoryAdminSessionRepository implements AdminSessionRepository {
  readonly sessions: AdminSession[] = [];
  private sequence = 0;

  async create(input: CreateAdminSessionInput): Promise<AdminSession> {
    const session: AdminSession = {
      id: `session-${++this.sequence}`,
      revokedAt: null,
      replacedById: null,
      createdAt: new Date(),
      ...input,
    };
    this.sessions.push(session);
    return session;
  }

  async findByTokenHash(tokenHash: string): Promise<AdminSession | null> {
    return this.sessions.find((session) => session.tokenHash === tokenHash) ?? null;
  }

  async markReplaced(id: string, replacedById: string, revokedAt: Date): Promise<void> {
    const session = this.sessions.find((candidate) => candidate.id === id);
    if (session && !session.revokedAt) {
      session.revokedAt = revokedAt;
      session.replacedById = replacedById;
    }
  }

  async revokeFamily(familyId: string, revokedAt: Date): Promise<void> {
    for (const session of this.sessions) {
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = revokedAt;
      }
    }
  }

  async deleteExpired(now: Date): Promise<void> {
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      if (this.sessions[i].expiresAt <= now) {
        this.sessions.splice(i, 1);
      }
    }
  }
}

const ADMIN_EMAIL = 'admin@agentrepo.dev';
const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const SUPABASE_ID = 'supabase-user-1';
const ADMIN_CREDENTIALS = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 30 * 1000;

class FakePasswordAuthenticator implements PasswordAuthenticator {
  async verify(email: string, password: string) {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
      ? { providerUserId: SUPABASE_ID }
      : null;
  }
}

class InMemoryAdminUserRepository implements AdminUserRepository {
  constructor(readonly admins: AdminUser[]) {}

  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    return this.admins.find((admin) => admin.email === email) ?? null;
  }

  async linkSupabaseId(userId: string, supabaseId: string): Promise<void> {
    const admin = this.admins.find((candidate) => candidate.id === userId);
    if (admin) {
      admin.supabaseId = supabaseId;
    }
  }
}

function buildUseCases(overrides?: { admins?: AdminUser[] }): {
  useCases: AdminAuthUseCases;
  repository: InMemoryAdminSessionRepository;
  adminUsers: InMemoryAdminUserRepository;
} {
  const repository = new InMemoryAdminSessionRepository();
  const adminUsers = new InMemoryAdminUserRepository(
    overrides?.admins ?? [{ id: 'user-1', email: ADMIN_EMAIL, supabaseId: null }]
  );
  let issued = 0;
  const useCases = createAdminAuthUseCases({
    sessions: repository,
    accessTokens: { issue: async () => `access-${++issued}` },
    passwordAuthenticator: new FakePasswordAuthenticator(),
    adminUsers,
    config: {
      accessTtlMs: ACCESS_TTL_MS,
      refreshTtlMs: REFRESH_TTL_MS,
      rotationGraceMs: ROTATION_GRACE_MS,
    },
  });
  return { useCases, repository, adminUsers };
}

describe('admin auth use cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('login', () => {
    it('issues an access + refresh pair for valid admin credentials', async () => {
      const { useCases, repository } = buildUseCases();

      const tokens = await useCases.login.execute(ADMIN_CREDENTIALS);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      expect(tokens.refreshExpiresAt?.getTime()).toBe(Date.now() + REFRESH_TTL_MS);
      expect(repository.sessions).toHaveLength(1);
      expect(repository.sessions[0].tokenHash).not.toContain(tokens.refreshToken);
    });

    it('links the provider id to the local user on first login', async () => {
      const { useCases, adminUsers } = buildUseCases();

      await useCases.login.execute(ADMIN_CREDENTIALS);

      expect(adminUsers.admins[0].supabaseId).toBe(SUPABASE_ID);
    });

    it('rejects a wrong password', async () => {
      const { useCases } = buildUseCases();

      await expect(
        useCases.login.execute({ email: ADMIN_EMAIL, password: 'wrong' })
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('rejects a user authenticated by the provider but without the admin role', async () => {
      const { useCases } = buildUseCases({ admins: [] });

      await expect(useCases.login.execute(ADMIN_CREDENTIALS)).rejects.toBeInstanceOf(
        InvalidCredentialsError
      );
    });

    it('rejects an admin whose linked provider id does not match the authenticated identity', async () => {
      const { useCases } = buildUseCases({
        admins: [{ id: 'user-1', email: ADMIN_EMAIL, supabaseId: 'someone-else' }],
      });

      await expect(useCases.login.execute(ADMIN_CREDENTIALS)).rejects.toBeInstanceOf(
        InvalidCredentialsError
      );
    });

    it('fails closed on empty credentials', async () => {
      const { useCases } = buildUseCases();

      await expect(
        useCases.login.execute({ email: '', password: '' })
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });
  });

  describe('refresh', () => {
    it('rotates the pair: new tokens, old refresh token revoked', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_CREDENTIALS);

      const second = await useCases.refresh.execute(first.refreshToken as string);

      expect(second.refreshToken).toBeTruthy();
      expect(second.refreshToken).not.toBe(first.refreshToken);
      expect(repository.sessions).toHaveLength(2);
      expect(repository.sessions[0].revokedAt).not.toBeNull();
      expect(repository.sessions[1].revokedAt).toBeNull();
      expect(repository.sessions[1].familyId).toBe(repository.sessions[0].familyId);
    });

    it('rejects an unknown refresh token', async () => {
      const { useCases } = buildUseCases();

      await expect(useCases.refresh.execute('made-up')).rejects.toBeInstanceOf(
        InvalidRefreshTokenError
      );
    });

    it('rejects an expired refresh token', async () => {
      const { useCases } = buildUseCases();
      const tokens = await useCases.login.execute(ADMIN_CREDENTIALS);

      vi.advanceTimersByTime(REFRESH_TTL_MS + 1);

      await expect(
        useCases.refresh.execute(tokens.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('serves an access token (without rotating) when a just-rotated token races back within the grace window', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_CREDENTIALS);
      await useCases.refresh.execute(first.refreshToken as string);

      vi.advanceTimersByTime(ROTATION_GRACE_MS - 1);
      const raced = await useCases.refresh.execute(first.refreshToken as string);

      expect(raced.accessToken).toBeTruthy();
      expect(raced.refreshToken).toBeUndefined();
      expect(repository.sessions).toHaveLength(2);
      expect(repository.sessions[1].revokedAt).toBeNull();
    });

    it('grants no grace to a token revoked by logout, even immediately', async () => {
      const { useCases } = buildUseCases();
      const tokens = await useCases.login.execute(ADMIN_CREDENTIALS);
      await useCases.logout.execute(tokens.refreshToken as string);

      await expect(
        useCases.refresh.execute(tokens.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('revokes the whole family when a rotated token is reused after the grace window', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_CREDENTIALS);
      const second = await useCases.refresh.execute(first.refreshToken as string);

      vi.advanceTimersByTime(ROTATION_GRACE_MS + 1);

      await expect(
        useCases.refresh.execute(first.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
      expect(repository.sessions.every((session) => session.revokedAt)).toBe(true);
      await expect(
        useCases.refresh.execute(second.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });
  });

  describe('logout', () => {
    it('revokes the whole session family', async () => {
      const { useCases } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_CREDENTIALS);
      const second = await useCases.refresh.execute(first.refreshToken as string);

      await useCases.logout.execute(second.refreshToken as string);

      await expect(
        useCases.refresh.execute(second.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('ignores unknown tokens', async () => {
      const { useCases } = buildUseCases();

      await expect(useCases.logout.execute('made-up')).resolves.toBeUndefined();
    });
  });
});

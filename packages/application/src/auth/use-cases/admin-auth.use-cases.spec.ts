import { AdminSession, InvalidCredentialsError, InvalidRefreshTokenError } from '@agentrepo/domain';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminSessionRepository,
  CreateAdminSessionInput,
} from '../ports/admin-session.repository';
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

const ADMIN_PASSWORD = 'correct-horse-battery-staple';
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 30 * 1000;

function buildUseCases(overrides?: { adminPassword?: string }): {
  useCases: AdminAuthUseCases;
  repository: InMemoryAdminSessionRepository;
} {
  const repository = new InMemoryAdminSessionRepository();
  let issued = 0;
  const useCases = createAdminAuthUseCases({
    sessions: repository,
    accessTokens: { issue: async () => `access-${++issued}` },
    config: {
      adminPassword: overrides?.adminPassword ?? ADMIN_PASSWORD,
      accessTtlMs: ACCESS_TTL_MS,
      refreshTtlMs: REFRESH_TTL_MS,
      rotationGraceMs: ROTATION_GRACE_MS,
    },
  });
  return { useCases, repository };
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
    it('issues an access + refresh pair for the correct password', async () => {
      const { useCases, repository } = buildUseCases();

      const tokens = await useCases.login.execute(ADMIN_PASSWORD);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      expect(tokens.refreshExpiresAt?.getTime()).toBe(Date.now() + REFRESH_TTL_MS);
      expect(repository.sessions).toHaveLength(1);
      expect(repository.sessions[0].tokenHash).not.toContain(tokens.refreshToken);
    });

    it('rejects a wrong password', async () => {
      const { useCases } = buildUseCases();

      await expect(useCases.login.execute('wrong')).rejects.toBeInstanceOf(
        InvalidCredentialsError
      );
    });

    it('fails closed when no admin password is configured', async () => {
      const { useCases } = buildUseCases({ adminPassword: '' });

      await expect(useCases.login.execute('')).rejects.toBeInstanceOf(
        InvalidCredentialsError
      );
    });
  });

  describe('refresh', () => {
    it('rotates the pair: new tokens, old refresh token revoked', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_PASSWORD);

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
      const tokens = await useCases.login.execute(ADMIN_PASSWORD);

      vi.advanceTimersByTime(REFRESH_TTL_MS + 1);

      await expect(
        useCases.refresh.execute(tokens.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('serves an access token (without rotating) when a just-rotated token races back within the grace window', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_PASSWORD);
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
      const tokens = await useCases.login.execute(ADMIN_PASSWORD);
      await useCases.logout.execute(tokens.refreshToken as string);

      await expect(
        useCases.refresh.execute(tokens.refreshToken as string)
      ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('revokes the whole family when a rotated token is reused after the grace window', async () => {
      const { useCases, repository } = buildUseCases();
      const first = await useCases.login.execute(ADMIN_PASSWORD);
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
      const first = await useCases.login.execute(ADMIN_PASSWORD);
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

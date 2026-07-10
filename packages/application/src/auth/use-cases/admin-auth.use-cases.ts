import { InvalidCredentialsError, InvalidRefreshTokenError } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import { AccessTokenIssuer } from '../ports/access-token-issuer';
import { AdminSessionRepository } from '../ports/admin-session.repository';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { PasswordAuthenticator } from '../ports/password-authenticator';
import { generateOpaqueToken, hashToken } from '../token-crypto';

export interface AdminAuthConfig {
  accessTtlMs: number;
  refreshTtlMs: number;
  /**
   * Window after a rotation during which the replaced refresh token still
   * yields an access token (no rotation). Absorbs parallel-request races
   * without weakening reuse detection beyond it.
   */
  rotationGraceMs: number;
}

export interface AdminSessionTokens {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken?: string;
  refreshExpiresAt?: Date;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminAuthDependencies {
  sessions: AdminSessionRepository;
  accessTokens: AccessTokenIssuer;
  passwordAuthenticator: PasswordAuthenticator;
  adminUsers: AdminUserRepository;
  config: AdminAuthConfig;
}

async function issueAccessToken(deps: AdminAuthDependencies): Promise<AdminSessionTokens> {
  const accessToken = await deps.accessTokens.issue(deps.config.accessTtlMs);
  return {
    accessToken,
    accessExpiresAt: new Date(Date.now() + deps.config.accessTtlMs),
  };
}

interface IssuedSessionPair {
  tokens: AdminSessionTokens;
  sessionId: string;
}

async function issueSessionPair(
  deps: AdminAuthDependencies,
  familyId: string
): Promise<IssuedSessionPair> {
  const refreshToken = generateOpaqueToken();
  const refreshExpiresAt = new Date(Date.now() + deps.config.refreshTtlMs);
  const session = await deps.sessions.create({
    tokenHash: await hashToken(refreshToken),
    familyId,
    expiresAt: refreshExpiresAt,
  });
  return {
    tokens: { ...(await issueAccessToken(deps)), refreshToken, refreshExpiresAt },
    sessionId: session.id,
  };
}

export class LoginAdmin implements UseCase<AdminLoginInput, AdminSessionTokens> {
  constructor(private readonly deps: AdminAuthDependencies) {}

  async execute(input?: AdminLoginInput): Promise<AdminSessionTokens> {
    const email = input?.email ?? '';
    const password = input?.password ?? '';
    if (!email || !password) {
      throw new InvalidCredentialsError();
    }
    const identity = await this.deps.passwordAuthenticator.verify(email, password);
    if (!identity) {
      throw new InvalidCredentialsError();
    }
    const admin = await this.deps.adminUsers.findAdminByEmail(email);
    // A provider identity that maps to a different local user is not an admin.
    if (!admin || (admin.supabaseId && admin.supabaseId !== identity.providerUserId)) {
      throw new InvalidCredentialsError();
    }
    if (!admin.supabaseId) {
      await this.deps.adminUsers.linkSupabaseId(admin.id, identity.providerUserId);
    }
    await this.deps.sessions.deleteExpired(new Date());
    const { tokens } = await issueSessionPair(this.deps, crypto.randomUUID());
    return tokens;
  }
}

export class RefreshAdminSession implements UseCase<string, AdminSessionTokens> {
  constructor(private readonly deps: AdminAuthDependencies) {}

  async execute(refreshToken = ''): Promise<AdminSessionTokens> {
    const now = new Date();
    const session = refreshToken
      ? await this.deps.sessions.findByTokenHash(await hashToken(refreshToken))
      : null;
    if (!session || session.expiresAt <= now) {
      throw new InvalidRefreshTokenError();
    }

    if (session.revokedAt) {
      const rotatedRace =
        session.replacedById !== null &&
        now.getTime() - session.revokedAt.getTime() <= this.deps.config.rotationGraceMs;
      if (rotatedRace) {
        // A sibling request already rotated this token; its successor cookie
        // is on its way to the browser, so only a fresh access token is needed.
        return issueAccessToken(this.deps);
      }
      // Any other use of a revoked token means it leaked: kill the family.
      await this.deps.sessions.revokeFamily(session.familyId, now);
      throw new InvalidRefreshTokenError();
    }

    const { tokens, sessionId } = await issueSessionPair(this.deps, session.familyId);
    await this.deps.sessions.markReplaced(session.id, sessionId, now);
    return tokens;
  }
}

export class LogoutAdmin implements UseCase<string, void> {
  constructor(private readonly deps: AdminAuthDependencies) {}

  async execute(refreshToken = ''): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const session = await this.deps.sessions.findByTokenHash(
      await hashToken(refreshToken)
    );
    if (session) {
      await this.deps.sessions.revokeFamily(session.familyId, new Date());
    }
  }
}

export interface AdminAuthUseCases {
  login: UseCase<AdminLoginInput, AdminSessionTokens>;
  refresh: UseCase<string, AdminSessionTokens>;
  logout: UseCase<string, void>;
}

export function createAdminAuthUseCases(deps: AdminAuthDependencies): AdminAuthUseCases {
  return {
    login: new LoginAdmin(deps),
    refresh: new RefreshAdminSession(deps),
    logout: new LogoutAdmin(deps),
  };
}

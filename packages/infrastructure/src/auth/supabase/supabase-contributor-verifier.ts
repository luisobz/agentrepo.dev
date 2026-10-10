import type {
  ContributorIdentity,
  ContributorSessionVerifier,
} from '@agentrepo/application';
import type { SupabaseAuthConfig } from './supabase-password-authenticator';

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function identityFrom(value: unknown): ContributorIdentity | null {
  const user = record(value);
  if (
    !user ||
    typeof user['id'] !== 'string' ||
    typeof user['email'] !== 'string' ||
    !user['email_confirmed_at']
  )
    return null;
  const profile = record(user['user_metadata']);
  const trustedMetadata = record(user['app_metadata']);
  const displayName =
    profile?.['full_name'] ?? profile?.['name'] ?? profile?.['user_name'];
  return {
    providerUserId: user['id'],
    email: user['email'].trim().toLowerCase(),
    name: (typeof displayName === 'string'
      ? displayName
      : user['email'].split('@')[0]
    )
      .trim()
      .slice(0, 120),
    provider: trustedMetadata?.['provider'] === 'github' ? 'github' : 'email',
  };
}

/** Verify against Auth; never authorize from caller-supplied profile or role claims. */
export class SupabaseContributorVerifier implements ContributorSessionVerifier {
  constructor(private readonly config: SupabaseAuthConfig) {}

  async verify(token: string): Promise<ContributorIdentity | null> {
    const response = await fetch(`${this.config.url}/auth/v1/user`, {
      headers: {
        apikey: this.config.publishableKey,
        authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8_000),
    }).catch(() => null);
    if (!response?.ok) return null;
    return identityFrom(await response.json().catch(() => null));
  }
}

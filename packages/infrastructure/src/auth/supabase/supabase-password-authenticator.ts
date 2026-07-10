import { PasswordAuthenticator, VerifiedIdentity } from '@agentrepo/application';
import { IdentityProviderUnavailableError } from '@agentrepo/domain';

export interface SupabaseAuthConfig {
  /** Supabase project URL, e.g. https://xyz.supabase.co */
  url: string;
  /** Publishable API key (sb_publishable_...); enough for the password grant. */
  publishableKey: string;
}

/**
 * Verifies email/password credentials against Supabase Auth (GoTrue) using
 * the password grant. The returned Supabase session is discarded: the admin
 * panel keeps its own opaque-token sessions, Supabase only answers whether
 * the credentials are valid.
 */
export class SupabasePasswordAuthenticator implements PasswordAuthenticator {
  constructor(private readonly config: SupabaseAuthConfig) {}

  async verify(email: string, password: string): Promise<VerifiedIdentity | null> {
    if (!this.config.url || !this.config.publishableKey) {
      throw new IdentityProviderUnavailableError();
    }

    let response: Response;
    try {
      response = await fetch(
        `${this.config.url}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            apikey: this.config.publishableKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );
    } catch {
      throw new IdentityProviderUnavailableError();
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return null;
    }
    if (!response.ok) {
      throw new IdentityProviderUnavailableError();
    }

    const body = (await response.json()) as { user?: { id?: string } };
    const providerUserId = body.user?.id;
    if (!providerUserId) {
      throw new IdentityProviderUnavailableError();
    }
    return { providerUserId };
  }
}

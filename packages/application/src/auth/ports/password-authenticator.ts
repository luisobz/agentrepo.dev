/** Identity confirmed by the external identity provider (Supabase Auth). */
export interface VerifiedIdentity {
  /** Stable user id at the provider (Supabase `auth.users.id`). */
  providerUserId: string;
}

/**
 * Verifies an email/password pair against the identity provider.
 * Returns `null` when the credentials are wrong; throws
 * `IdentityProviderUnavailableError` when the provider cannot be reached.
 */
export interface PasswordAuthenticator {
  verify(email: string, password: string): Promise<VerifiedIdentity | null>;
}

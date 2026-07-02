/**
 * Server-only access to the HMAC secret shared with backend-web. Returns
 * null when unset so callers fail closed instead of signing/verifying with
 * a guessable value.
 */
export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret ? secret : null;
}

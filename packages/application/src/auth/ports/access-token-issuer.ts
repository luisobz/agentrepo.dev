/**
 * Signs short-lived access tokens. Kept as a port so the application layer
 * stays free of the signing implementation (HMAC secret, token format).
 */
export interface AccessTokenIssuer {
  issue(ttlMs: number): Promise<string>;
}

/**
 * Opaque-token helpers for admin sessions (Web Crypto, no dependencies).
 * Refresh tokens are 256-bit random values; only their SHA-256 hash is
 * stored, so a database leak does not expose usable tokens.
 */

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateOpaqueToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Constant-time comparison of two secrets of arbitrary length. Both inputs
 * are hashed first so length differences do not leak through timing.
 */
export async function secureEquals(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([hashToken(a), hashToken(b)]);
  let mismatch = 0;
  for (let i = 0; i < hashA.length; i++) {
    mismatch |= hashA.charCodeAt(i) ^ hashB.charCodeAt(i);
  }
  return mismatch === 0;
}

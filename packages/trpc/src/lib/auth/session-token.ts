/**
 * Minimal HMAC-SHA256 signed session tokens, shared by the admin app (signs
 * at login, verifies in middleware) and the API (verifies per request).
 * Tokens are typed: short-lived `access` tokens authenticate requests and
 * long-lived `refresh` tokens can only mint new pairs, never call the API.
 * Built on Web Crypto so it runs in Node and edge runtimes alike.
 */

const encoder = new TextEncoder();

export type SessionTokenType = 'access' | 'refresh';

interface SessionTokenPayload {
  sub: 'admin';
  typ: SessionTokenType;
  exp: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Constant-time comparison of two secrets of arbitrary length. Both inputs
 * are hashed first so length differences do not leak through timing.
 */
export async function secureCompare(a: string, b: string): Promise<boolean> {
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  return timingSafeEqual(
    base64UrlEncode(new Uint8Array(digestA)),
    base64UrlEncode(new Uint8Array(digestB))
  );
}

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate['sub'] === 'admin' &&
    (candidate['typ'] === 'access' || candidate['typ'] === 'refresh') &&
    typeof candidate['exp'] === 'number'
  );
}

export async function createSessionToken(
  secret: string,
  ttlMs: number,
  type: SessionTokenType = 'access'
): Promise<string> {
  const payload: SessionTokenPayload = {
    sub: 'admin',
    typ: type,
    exp: Date.now() + ttlMs,
  };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  return `${encodedPayload}.${await hmacSign(encodedPayload, secret)}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
  secret: string,
  type: SessionTokenType = 'access'
): Promise<boolean> {
  if (!token || !secret) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await hmacSign(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload: unknown = JSON.parse(base64UrlDecode(encodedPayload));
    return (
      isSessionTokenPayload(payload) &&
      payload.typ === type &&
      payload.exp > Date.now()
    );
  } catch {
    return false;
  }
}

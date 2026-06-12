/**
 * Minimal HMAC-SHA256 signed session token, shared by the admin app (signs
 * at login, verifies in middleware) and the API (verifies per request).
 * Built on Web Crypto so it runs in Node and edge runtimes alike.
 */

const encoder = new TextEncoder();

interface SessionTokenPayload {
  sub: 'admin';
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

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>)['sub'] === 'admin' &&
    typeof (value as Record<string, unknown>)['exp'] === 'number'
  );
}

export async function createSessionToken(
  secret: string,
  ttlMs: number
): Promise<string> {
  const payload: SessionTokenPayload = { sub: 'admin', exp: Date.now() + ttlMs };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  return `${encodedPayload}.${await hmacSign(encodedPayload, secret)}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
  secret: string
): Promise<boolean> {
  if (!token) {
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
    return isSessionTokenPayload(payload) && payload.exp > Date.now();
  } catch {
    return false;
  }
}

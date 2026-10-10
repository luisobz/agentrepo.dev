/** A short-lived, encrypted bridge bound to a private, host-only browser nonce.
 * Only its hash crosses domains, so captured redirect URLs cannot recreate the
 * required cookie. Provider credentials never appear in plaintext in a URL.
 */
const encoder = new TextEncoder();

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decode(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(
    atob(value.replace(/-/g, '+').replace(/_/g, '/')),
    (character) => character.charCodeAt(0),
  );
}

async function encryptionKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`agentrepo:admin-handoff:v1:${secret}`),
  );
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function hashAdminNonce(nonce: string): Promise<string> {
  return encode(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(nonce)),
    ),
  );
}

export async function createAdminHandoff(input: {
  token: string;
  challenge: string;
  secret: string;
}): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = encoder.encode(
    JSON.stringify({
      token: input.token,
      challenge: input.challenge,
      exp: Date.now() + 60_000,
    }),
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await encryptionKey(input.secret),
    payload,
  );
  return `${encode(iv)}.${encode(new Uint8Array(encrypted))}`;
}

export async function openAdminHandoff(
  ticket: string,
  nonce: string,
  secret: string,
): Promise<string | null> {
  if (!ticket || ticket.length > 30_000 || !nonce || !secret) return null;
  try {
    const parts = ticket.split('.');
    if (parts.length !== 2) return null;
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decode(parts[0]) },
      await encryptionKey(secret),
      decode(parts[1]),
    );
    const payload: unknown = JSON.parse(new TextDecoder().decode(decrypted));
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('token' in payload) ||
      !('challenge' in payload) ||
      !('exp' in payload)
    )
      return null;
    return typeof payload.token === 'string' &&
      typeof payload.exp === 'number' &&
      payload.exp > Date.now() &&
      payload.exp <= Date.now() + 60_000 &&
      payload.challenge === (await hashAdminNonce(nonce))
      ? payload.token
      : null;
  } catch {
    return null;
  }
}

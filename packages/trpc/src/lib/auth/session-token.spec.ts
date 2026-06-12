import { describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken } from './session-token';

const SECRET = 'test-secret';

describe('session token', () => {
  it('verifies a freshly created token', async () => {
    const token = await createSessionToken(SECRET, 60_000);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(true);
  });

  it('rejects an expired token', async () => {
    const token = await createSessionToken(SECRET, -1);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken('other-secret', 60_000);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(false);
  });

  it('rejects a tampered payload', async () => {
    const token = await createSessionToken(SECRET, 60_000);
    const [, signature] = token.split('.');
    const forgedPayload = btoa(
      JSON.stringify({ sub: 'admin', exp: Date.now() + 86_400_000 })
    ).replace(/=+$/, '');

    await expect(
      verifySessionToken(`${forgedPayload}.${signature}`, SECRET)
    ).resolves.toBe(false);
  });

  it('rejects missing or malformed tokens', async () => {
    await expect(verifySessionToken(null, SECRET)).resolves.toBe(false);
    await expect(verifySessionToken('', SECRET)).resolves.toBe(false);
    await expect(verifySessionToken('not-a-token', SECRET)).resolves.toBe(false);
  });
});

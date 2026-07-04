import { describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken } from './session-token';

const SECRET = 'test-secret';

describe('session token', () => {
  it('verifies a freshly created access token', async () => {
    const token = await createSessionToken(SECRET, 60_000);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(true);
  });

  it('verifies a refresh token only as a refresh token', async () => {
    const token = await createSessionToken(SECRET, 60_000, 'refresh');

    await expect(verifySessionToken(token, SECRET, 'refresh')).resolves.toBe(true);
    await expect(verifySessionToken(token, SECRET, 'access')).resolves.toBe(false);
  });

  it('rejects an access token presented as a refresh token', async () => {
    const token = await createSessionToken(SECRET, 60_000, 'access');

    await expect(verifySessionToken(token, SECRET, 'refresh')).resolves.toBe(false);
  });

  it('rejects an expired token', async () => {
    const token = await createSessionToken(SECRET, -1);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken('other-secret', 60_000);

    await expect(verifySessionToken(token, SECRET)).resolves.toBe(false);
  });

  it('rejects any token when the secret is empty', async () => {
    const token = await createSessionToken(SECRET, 60_000);

    await expect(verifySessionToken(token, '')).resolves.toBe(false);
  });

  it('rejects a tampered payload', async () => {
    const token = await createSessionToken(SECRET, 60_000);
    const [, signature] = token.split('.');
    const forgedPayload = btoa(
      JSON.stringify({ sub: 'admin', typ: 'access', exp: Date.now() + 86_400_000 })
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

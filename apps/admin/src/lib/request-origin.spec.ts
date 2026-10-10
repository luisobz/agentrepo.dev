import { afterEach, expect, it, vi } from 'vitest';
import { hasTrustedOrigin } from './request-origin';
afterEach(() => vi.unstubAllEnvs());
it('accepts only the public origin when an internal proxy URL is used', () => {
  vi.stubEnv('ADMIN_APP_URL', 'https://public.example');
  for (const [origin, expected] of [
    ['https://public.example', true],
    ['https://evil.example', false],
    ['http://127.0.0.1:3000', false],
  ]) {
    const request = new Request('http://127.0.0.1:3000/api/action', {
      headers: { origin: String(origin) },
    });
    expect(hasTrustedOrigin(request)).toBe(expected);
  }
});
it('rejects missing origin and malformed configuration', () => {
  vi.stubEnv('ADMIN_APP_URL', 'https://public.example');
  expect(hasTrustedOrigin(new Request('https://public.example'))).toBe(false);
  vi.stubEnv('ADMIN_APP_URL', 'invalid');
  expect(
    hasTrustedOrigin(
      new Request('https://public.example', {
        headers: { origin: 'https://public.example' },
      }),
    ),
  ).toBe(false);
});

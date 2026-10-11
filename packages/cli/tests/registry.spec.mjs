import { afterEach, expect, it, vi } from 'vitest';
import { fetchPublishedSkill } from '../src/registry.mjs';
afterEach(() => vi.unstubAllGlobals());
it('requests the exact published version and preserves split Unicode bytes', async () => {
  const payload = {
    version: '1.0.0',
    content: 'Auditoría 🛡️',
    isLocked: false,
  };
  const bytes = new TextEncoder().encode(
    JSON.stringify({ result: { data: { json: payload } } }),
  );
  const fetcher = vi.fn(
    async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
            controller.close();
          },
        }),
      ),
  );
  vi.stubGlobal('fetch', fetcher);
  expect(
    await fetchPublishedSkill(
      'https://agentrepo.dev/web/api/v1',
      'example',
      '1.0.0',
    ),
  ).toEqual(payload);
  const [url, options] = fetcher.mock.calls[0];
  expect(url.pathname).toBe('/web/api/v1/api/trpc/skills.byVersion');
  expect(JSON.parse(url.searchParams.get('input'))).toEqual({
    json: { slug: 'example', version: '1.0.0' },
  });
  expect(options.redirect).toBe('error');
});
it('rejects HTTP errors and invalid catalogue envelopes', async () => {
  vi.stubGlobal('fetch', async () => new Response('{}', { status: 404 }));
  await expect(
    fetchPublishedSkill('https://example.com', 'example', '1.0.0'),
  ).rejects.toThrow(/HTTP 404/);
  vi.stubGlobal('fetch', async () => new Response('{}'));
  await expect(
    fetchPublishedSkill('https://example.com', 'example', '1.0.0'),
  ).rejects.toThrow(/inválida/);
});

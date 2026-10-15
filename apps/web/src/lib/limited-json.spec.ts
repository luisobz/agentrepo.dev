// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readLimitedJson } from './limited-json';
describe('bounded JSON requests', () => {
  it('parses small UTF-8 JSON', async () => {
    expect(
      await readLimitedJson(
        new Request('https://example.com', {
          method: 'POST',
          body: '{"message":"hola"}',
        }),
      ),
    ).toEqual({ message: 'hola' });
  });
  it('rejects dishonest/missing length headers using actual bytes', async () => {
    for (const headers of [{}, { 'content-length': '1' }])
      await expect(
        readLimitedJson(
          new Request('https://example.com', {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: '😀'.repeat(100) }),
          }),
          100,
        ),
      ).rejects.toMatchObject({ status: 413 });
  });
  it('rejects invalid UTF-8 and malformed JSON', async () => {
    for (const body of ['not JSON', new Uint8Array([255])])
      await expect(
        readLimitedJson(
          new Request('https://example.com', { method: 'POST', body }),
        ),
      ).rejects.toMatchObject({ status: 400 });
  });
});

it('rejects HTTP content compression before reading the body', async () => {
  await expect(
    readLimitedJson(
      new Request('https://example.com', {
        method: 'POST',
        headers: { 'content-encoding': 'gzip' },
        body: 'compressed bytes',
      }),
    ),
  ).rejects.toMatchObject({ status: 400 });
});

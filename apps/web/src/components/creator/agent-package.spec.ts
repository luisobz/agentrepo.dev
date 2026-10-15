// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Uint8ArrayWriter, Uint8ArrayReader, ZipWriter } from '@zip.js/zip.js';
import { readAgentZip } from './agent-package';

async function archive(
  entries: {
    name: string;
    data?: Uint8Array;
    directory?: boolean;
    unixMode?: number;
  }[],
) {
  const writer = new ZipWriter(new Uint8ArrayWriter(), {
    useWebWorkers: false,
  });
  for (const entry of entries)
    await writer.add(
      entry.name,
      entry.directory
        ? undefined
        : new Uint8ArrayReader(
            entry.data ?? new TextEncoder().encode('source'),
          ),
      { directory: entry.directory, unixMode: entry.unixMode },
    );
  return new Blob([await writer.close()]);
}
describe('untrusted agent ZIPs', () => {
  it('preserves nested text sources and removes one enclosing project directory', async () => {
    const blob = await archive([
      { name: 'project/README.md' },
      { name: 'project/src/main.py' },
    ]);
    expect((await readAgentZip(blob)).map((file) => file.path)).toEqual([
      'README.md',
      'src/main.py',
    ]);
  });
  it.each([
    '../evil.py',
    '/evil.py',
    '.git/config',
    'nested.zip',
    'private.key',
  ])('rejects unsafe archive entry %s', async (name) => {
    await expect(readAgentZip(await archive([{ name }]))).rejects.toThrow();
  });
  it('rejects symlinks, invalid UTF-8 and expansion bombs', async () => {
    for (const entries of [
      [{ name: 'link.py', unixMode: 0o120777 }],
      [{ name: 'file.py', data: new Uint8Array([255, 254, 0]) }],
      [{ name: 'bomb.md', data: new Uint8Array(100_001).fill(65) }],
    ])
      await expect(readAgentZip(await archive(entries))).rejects.toThrow();
  });
  it('rejects malformed and oversized archives', async () => {
    await expect(readAgentZip(new Blob(['not a zip']))).rejects.toThrow();
    await expect(
      readAgentZip(new Blob([new Uint8Array(4_000_001)])),
    ).rejects.toThrow();
  });
});

it('rejects corrupted archive CRC rather than accepting damaged text', async () => {
  const writer = new ZipWriter(new Uint8ArrayWriter(), {
    useWebWorkers: false,
    level: 0,
  });
  await writer.add(
    'main.py',
    new Uint8ArrayReader(new TextEncoder().encode('hello-world')),
  );
  const bytes = await writer.close();
  const index = Buffer.from(bytes).indexOf(Buffer.from('hello-world'));
  expect(index).toBeGreaterThan(0);
  bytes[index] = 88;
  await expect(readAgentZip(new Blob([bytes]))).rejects.toThrow();
});

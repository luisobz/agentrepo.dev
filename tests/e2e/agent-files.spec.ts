import { expect, test } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from '../../apps/admin/node_modules/jszip';

test('the file browser groups folders before file types on desktop and mobile', async ({
  page,
}) => {
  await page.goto('/agents/linked-project');
  await page.getByText('Files & downloads', { exact: true }).click();
  const tree = page.getByRole('navigation', { name: 'Agent files' });
  await expect(tree).toBeVisible();
  await expect(tree.locator(':scope > ul > li > button')).toHaveText([
    'docs',
    'src',
    'settings.json',
    'README.md',
    'z.py',
  ]);
  await tree.getByRole('button', { name: 'src', exact: true }).click();
  await tree.getByRole('button', { name: 'b.py', exact: true }).click();
  await expect(
    page.locator('pre code').filter({ hasText: 'print(2)' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

// Exercise Next's real compiled worker, including its bootstrap and codec chunks.
async function workerURL() {
  const folder = path.join(process.cwd(), 'apps/web/.next/static/chunks');
  for (const name of await readdir(folder)) {
    if (!name.endsWith('.js')) continue;
    const source = await readFile(path.join(folder, name), 'utf8');
    const match = source.match(
      /\.f\("(static\/chunks\/turbopack-worker-[^"]+)",\[([^\]]+)\]\)/,
    );
    if (match && source.includes('Source package processing timed out')) {
      const chunks = JSON.parse('[' + match[2] + ']') as string[];
      return (
        '/_next/' +
        match[1] +
        '#params=' +
        encodeURIComponent(
          JSON.stringify([
            chunks.map((chunk) => '/_next/' + chunk).reverse(),
            '',
            '/_next/',
          ]),
        )
      );
    }
  }
  throw new Error('Compiled source-package worker not found');
}

test('compiled upload worker accepts source ZIPs and rejects traversal, symlinks and expansion bombs', async ({
  page,
}) => {
  await page.goto('/creator');
  const url = await workerURL();
  const zip = new JSZip();
  zip.file('project/README.md', '# Agent');
  zip.file('project/src/main.py', 'print(1)');
  const bad = new JSZip();
  bad.file('../evil.py', 'not executed');
  const link = new JSZip();
  link.file('link.py', '../../secret', { unixPermissions: 0o120777 });
  const bomb = new JSZip();
  bomb.file('bomb.md', 'a'.repeat(100_001));
  for (const [archive, accepted] of [
    [zip, true],
    [bad, false],
    [link, false],
    [bomb, false],
  ] as const) {
    const bytes = Array.from(
      await archive.generateAsync({
        type: 'uint8array',
        platform: 'UNIX',
        compression: 'DEFLATE',
      }),
    );
    const result = await page.evaluate(
      async ({ url, bytes }) => {
        return new Promise<{
          files?: { path: string; content: string }[];
          error?: string;
        }>((resolve, reject) => {
          const worker = new Worker(url);
          const timer = setTimeout(() => {
            worker.terminate();
            reject(new Error('Worker timed out'));
          }, 20_000);
          worker.onmessage = (event) => {
            clearTimeout(timer);
            worker.terminate();
            resolve(event.data);
          };
          worker.onerror = () => {
            clearTimeout(timer);
            worker.terminate();
            reject(new Error('Worker failed'));
          };
          worker.postMessage([new File([new Uint8Array(bytes)], 'agent.zip')]);
        });
      },
      { url, bytes },
    );
    if (accepted)
      expect(result.files?.map((file) => file.path)).toEqual([
        'README.md',
        'src/main.py',
      ]);
    else expect(result.error).toBeTruthy();
  }
});

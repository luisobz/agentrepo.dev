import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const original =
  '---\nname: linked-project\ndescription: Skill metadata\n---\n\n# Linked skill\n\nUse **clear language**.\n\n---\n\nKeep this separator.';

test('skills render the body while Raw, Copy and Download retain metadata', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/skills/linked-project');
  await expect(
    page.getByRole('heading', { name: 'Linked skill', exact: true }),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Skill metadata');
  await expect(
    page.locator('main strong:visible').filter({ hasText: 'clear language' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Raw', exact: true }).click();
  expect(await page.locator('main pre:visible code').textContent()).toBe(
    original,
  );
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Copied', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    original,
  );
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .md', exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('linked-project-1.0.0.md');
  const path = await download.path();
  expect(path).not.toBeNull();
  if (path !== null) expect(await readFile(path, 'utf8')).toBe(original);
  await page.getByRole('tab', { name: 'Rendered', exact: true }).click();
  await expect(page.locator('body')).not.toContainText('Skill metadata');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

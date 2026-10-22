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
  expect(download.suggestedFilename()).toBe('linked-project-1.0.0-en.md');
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

test('latest downloads use the released snapshot rather than an edited draft', async ({
  page,
}) => {
  await page.goto('/skills/draft-head');
  await expect(
    page.getByRole('heading', { name: 'Linked skill', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText('Unreleased draft');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .md', exact: true }).click();
  const download = await downloading;
  const file = await download.path();
  expect(file).not.toBeNull();
  if (file) expect(await readFile(file, 'utf8')).toBe(original);
});

test('an agent release with no README never inherits an unpublished README', async ({
  page,
}) => {
  await page.goto('/agents/draft-head');
  await expect(page.getByRole('main')).not.toContainText('Unreleased README');
  await page.getByRole('main').getByText('Files & downloads', { exact: true }).click();
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Download v1.0.0', exact: true })
    .click();
  const download = await downloading;
  const file = await download.path();
  expect(file).not.toBeNull();
  if (file)
    expect(JSON.parse(await readFile(file, 'utf8'))).toMatchObject({
      readme: null,
      files: [],
    });
});

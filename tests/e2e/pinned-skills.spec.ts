import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('catalogue links pin releases and unversioned/legacy links resolve to exact paths', async ({
  page,
}) => {
  await page.goto('/skills');
  const skill = page.getByRole('link', { name: /Linked project/ });
  await expect(skill).toHaveAttribute('href', '/skills/linked-project/1.0.0');
  await skill.click();
  await expect(page).toHaveURL(/\/skills\/linked-project\/1\.0\.0$/);
  await page.goto('/skills/linked-project');
  await expect(page).toHaveURL(/\/skills\/linked-project\/1\.0\.0$/);
  await page.goto('/skills/linked-project/latest');
  await expect(page).toHaveURL(/\/skills\/linked-project\/1\.0\.0$/);
  await page.goto('/skills/linked-project?version=0.9.0');
  await expect(page).toHaveURL(/\/skills\/linked-project\/0\.9\.0$/);
});

test('old release content, download and metadata remain pinned when latest differs', async ({
  page,
}) => {
  await page.goto('/skills/linked-project/0.9.0?version=1.0.0');
  await expect(
    page.getByRole('heading', { name: 'Original release', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText('clear language');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://agentrepo.dev/skills/linked-project/0.9.0',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://agentrepo.dev/skills/linked-project/0.9.0',
  );
  await expect(
    page.getByRole('link', { name: 'View latest (v1.0.0)' }),
  ).toHaveAttribute('href', '/skills/linked-project/1.0.0');
  await expect(
    page.getByRole('link', { name: '1.0.0', exact: true }),
  ).toHaveAttribute('href', '/skills/linked-project/1.0.0');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .md', exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('linked-project-0.9.0-en.md');
  const file = await download.path();
  expect(file).not.toBeNull();
  if (file)
    expect(await readFile(file, 'utf8')).toBe(
      '# Original release\n\nKeep the original instructions.',
    );
});

test('missing or invalid snapshots never display latest or an unreleased draft', async ({
  page,
}) => {
  for (const path of [
    '/skills/linked-project/9.9.9',
    '/skills/linked-project/bogus',
    '/skills/missing-snapshot/1.0.0',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Linked skill', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Download .md', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]').first(),
    ).toHaveAttribute('content', /noindex/);
    await expect(
      page.getByRole('heading', { name: 'Skill not found', exact: true }),
    ).toBeVisible();
  }
});

test('agents receive HTTP redirects without needing JavaScript', async ({
  request,
}) => {
  const response = await request.get('/skills/linked-project', {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(307);
  expect(response.headers()['location']).toContain(
    '/skills/linked-project/1.0.0',
  );
});

import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('language selection refreshes skill prose and its actual download', async ({
  page,
  isMobile,
}) => {
  await page.goto('/skills/linked-project');
  await expect(
    page.getByRole('heading', { name: 'Linked skill', exact: true }),
  ).toBeVisible();
  if (isMobile)
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('button', { name: 'es', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Skill enlazada', exact: true }),
  ).toBeVisible();
  await expect(page.locator('main [lang="es"]')).toBeVisible();
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Descargar .md', exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('linked-project-1.0.0-es.md');
  const file = await download.path();
  expect(file).not.toBeNull();
  if (file)
    expect(await readFile(file, 'utf8')).toContain('Usa **lenguaje claro**.');
  await page.goto('/blog/linked-project');
  await expect(
    page.getByRole('heading', { name: 'Artículo enlazado', exact: true }),
  ).toBeVisible();
  await page.goto('/agents/linked-project');
  await expect(
    page.getByRole('heading', { name: 'Guía del proyecto', exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('main')
      .getByText('Documentación en español.', { exact: true }),
  ).toBeVisible();
});

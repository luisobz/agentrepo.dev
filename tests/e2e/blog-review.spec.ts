import { expect, test } from '@playwright/test';

test('web previews stay private and excluded from indexing for anonymous visitors', async ({
  page,
}) => {
  for (const path of [
    '/blog/review',
    '/blog/review/11111111-1111-4111-8111-111111111111',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    expect(response?.headers()['cache-control']).toContain('no-store');
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await expect(
      page.getByRole('button', { name: 'Publish article', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Publicar artículo', exact: true }),
    ).toHaveCount(0);
  }
  await page.goto('/blog');
  await expect(
    page.getByRole('link', { name: /Review drafts|Revisar borradores/ }),
  ).toHaveCount(0);
});

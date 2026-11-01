import { expect, test } from '@playwright/test';
test('home separates latest and trends with its independent character', async ({
  page,
}) => {
  await page.goto('/es');
  await expect(
    page.getByRole('heading', { name: 'Últimos', exact: true }),
  ).toBeVisible();
  const trends = page.locator('#trending');
  await expect(
    trends.getByRole('heading', { name: 'Tendencias', exact: true }),
  ).toBeVisible();
  await expect(trends.locator('[data-character="trending"]')).toHaveCount(1);
  await expect(
    trends.locator('a[href="/es/skills/linked-project/1.0.0"]'),
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test('trending is a third independent actor near downloads, not part of the thematic cast', async ({
  page,
}) => {
  await page.goto('/en/agents/linked-project');
  await expect(
    page.getByTestId('avatar-scene').getByRole('button'),
  ).toHaveCount(2);
  const indicator = page.getByTestId('trending-indicator');
  await expect(indicator).toHaveCount(1);
  await expect(indicator.locator('[data-character="trending"]')).toHaveCount(1);
  await indicator.scrollIntoViewIfNeeded();
  const distance = await indicator.evaluate((node) => {
    const details = node.nextElementSibling;
    return details
      ? details.getBoundingClientRect().top -
          node.getBoundingClientRect().bottom
      : Infinity;
  });
  expect(Math.abs(distance)).toBeLessThan(80);
});
test('public blog shows a separate trending indicator', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/blog/linked-project');
  const indicator = page.getByTestId('trending-indicator');
  await expect(indicator).toBeVisible();
  await expect(indicator.locator('svg')).toHaveAttribute(
    'data-animated',
    'false',
  );
});

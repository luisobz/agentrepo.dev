import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('catalogue and home remain readable without JavaScript', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('main h1').first()).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Explore AgentRepo.dev' }),
  ).toBeVisible();
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '{}',
  );
  expect(graph['@graph']).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@type': 'WebApplication',
        name: 'AgentRepo.dev',
      }),
    ]),
  );
  await page.goto('/skills');
  await expect(page.locator('main h1').first()).toBeVisible();
  await expect(page.locator('main a[href^="/en/skills/"]').first()).toBeVisible();
  await expect(page.getByText('Loading content…')).toHaveCount(0);
});

test('public detail pages and catalogues expose content without hydration', async ({
  page,
}) => {
  for (const path of [
    '/agents',
    '/blog',
    '/skills/linked-project/1.0.0',
    '/agents/linked-project',
    '/blog/linked-project',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByText('Loading content…')).toHaveCount(0);
  }
});

test('Spanish homepage explains the same platform without JavaScript', async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: 'locale', value: 'es', domain: 'localhost', path: '/' },
  ]);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Explora AgentRepo.dev' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('main')).toContainText('fija sus versiones');
});

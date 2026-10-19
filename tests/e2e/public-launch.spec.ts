import { expect, test } from '@playwright/test';
test('public sharing, legal links and account indexing are ready', async ({
  page,
}) => {
  await page.route('https://static.cloudflareinsights.com/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: '/* isolated analytics fixture */',
    }),
  );
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://agentrepo.dev/og-cover.jpg',
  );
  const cover = await page.request.get('/og-cover.jpg');
  expect(cover.ok()).toBe(true);
  expect(cover.headers()['content-type']).toContain('image/jpeg');
  for (const route of ['/privacy', '/terms']) {
    await page
      .locator('footer')
      .getByRole('link', {
        name: route === '/privacy' ? 'Privacy' : 'Terms',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(new RegExp(route + '$'));
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto('/creator');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
  await expect(page.locator('#cloudflare-web-analytics')).toHaveCount(0);
});

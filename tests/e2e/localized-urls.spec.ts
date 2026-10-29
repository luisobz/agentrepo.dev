import { expect, test } from '@playwright/test';

test('browser language selects the first URL without cookies', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveURL('http://localhost:3000/es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(
    page.getByRole('heading', { name: 'Explora AgentRepo.dev' }),
  ).toBeVisible();
  await context.close();
});

test('share URLs fix body language, metadata and canonicals despite conflicting preferences', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'locale', value: 'en', domain: 'localhost', path: '/' },
  ]);
  for (const locale of ['es', 'en']) {
    const path = `/${locale}/blog/linked-project`;
    const title = locale === 'es' ? 'Artículo enlazado' : 'Linked article';
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      locale === 'es' ? 'Proyecto enlazado' : 'Linked project',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://agentrepo.dev' + path,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://agentrepo.dev' + path,
    );
    for (const language of ['es', 'en']) {
      await expect(
        page.locator(`link[hreflang="${language}"]`),
      ).toHaveAttribute(
        'href',
        `https://agentrepo.dev/${language}/blog/linked-project`,
      );
    }
  }
});

test('switching language changes the URL and public navigation preserves it', async ({
  page,
  isMobile,
}) => {
  await page.goto('/en/blog/linked-project');
  if (isMobile)
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('button', { name: 'es', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/blog\/linked-project$/);
  if (isMobile)
    await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  const header = isMobile
    ? page.locator('#mobile-navigation')
    : page.locator('header');
  await header.getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/skills$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('sitemap exposes both language URLs without private review surfaces', async ({
  request,
}) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain('https://agentrepo.dev/es/blog/linked-project');
  expect(xml).toContain('https://agentrepo.dev/en/blog/linked-project');
  expect(xml).not.toContain('/blog/review');
  expect(xml).not.toContain('/skills/private');
});

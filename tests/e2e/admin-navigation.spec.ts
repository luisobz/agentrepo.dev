import { expect, test } from '@playwright/test';
import { createSessionToken } from '../../packages/trpc/src/lib/auth/session-token';
import { ADMIN_UI_TEST_SECRET } from './fixtures/admin-session';

test('admin navigation stays compact and returns to the public site', async ({
  page,
  context,
  isMobile,
}) => {
  await context.addCookies([
    {
      name: '__Host-agentrepo_admin_session',
      value: await createSessionToken(ADMIN_UI_TEST_SECRET, 60_000),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('http://localhost:3001/admin');
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible();
  const website = page.getByRole('link', { name: 'View website', exact: true });
  await expect(website).toBeVisible();
  await expect(website).toHaveAttribute('href', 'https://agentrepo.dev');
  const navigation = page.getByRole('navigation', { name: 'Administration' });
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  if (isMobile) {
    await expect(navigation).toBeHidden();
    const heading = await page
      .getByRole('heading', { name: 'Dashboard', exact: true })
      .boundingBox();
    expect(heading!.y).toBeLessThan(140);
    await toggle.click();
    await expect(navigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(navigation).toBeHidden();
    await expect(toggle).toBeFocused();
  }
  for (const name of ['Skills', 'Agents', 'Blog']) {
    if (isMobile)
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await navigation.getByRole('link', { name, exact: true }).click();
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    if (isMobile) {
      await expect(navigation).toBeHidden();
      await page.getByRole('button', { name: 'Open navigation' }).click();
    }
    await expect(
      navigation.getByRole('link', { name, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    if (isMobile)
      await page.getByRole('button', { name: 'Close navigation' }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.route('https://agentrepo.dev/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>Public website</h1>',
    }),
  );
  await website.click();
  await expect(page).toHaveURL('https://agentrepo.dev/');
});

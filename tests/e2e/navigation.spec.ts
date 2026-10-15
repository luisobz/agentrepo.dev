import { expect, test } from '@playwright/test';

test('Creator opens the contribution flow and requires authentication', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
  await page
    .getByRole('link', { name: 'Creator', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/creator$/);
  await expect(
    page.getByRole('heading', { name: 'Sign in to contribute' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Connect with GitHub' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Use email instead' }).click();
  await expect(page.locator('input[type=password]')).toBeVisible();
});

test('mobile menu reserves its top right for the avatar and releases focus on Escape', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile menu');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.locator('#mobile-navigation');
  const avatar = page.getByTestId('avatar-slot-mobile-menu');
  await expect(menu).toBeVisible();
  await expect(avatar).toHaveAttribute('data-active', 'true');
  const slot = await avatar.boundingBox();
  const firstLink = await menu
    .getByRole('link', { name: 'Skills', exact: true })
    .boundingBox();
  expect(slot).not.toBeNull();
  expect(firstLink).not.toBeNull();
  expect(slot!.y + slot!.height).toBeLessThanOrEqual(firstLink!.y);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
  await expect(avatar).toHaveAttribute('data-active', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('navigation closes the drawer and renders the selected catalogue', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
  await (isMobile ? page.locator('#mobile-navigation') : page.locator('header'))
    .getByRole('link', { name: 'Agents', exact: true })
    .click();
  await expect(page).toHaveURL(/\/agents$/);
  await expect(
    page.getByRole('heading', { name: 'Agents', exact: true }),
  ).toBeVisible();
  if (isMobile)
    await expect(page.locator('#mobile-navigation')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

for (const isAdmin of [false, true]) {
  test(`admin shortcut visibility follows verified role (${isAdmin})`, async ({
    page,
    isMobile,
  }) => {
    await page.route('**/auth/admin-access', (route) =>
      route.fulfill({
        json: { isAdmin },
        headers: { 'Cache-Control': 'private, no-store' },
      }),
    );
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
    const container = isMobile
      ? page.locator('#mobile-navigation')
      : page.locator('header');
    const link = container.getByRole('link', { name: 'Admin panel' });
    if (isAdmin) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute(
        'href',
        'https://admin.agentrepo.dev/api/auth/sso',
      );
      const box = await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(
        page.viewportSize()!.width,
      );
    } else await expect(link).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('admin visibility is checked once across both menus and client navigation', async ({
  page,
  isMobile,
}) => {
  let checks = 0;
  await page.route('**/auth/admin-access', (route) => {
    checks++;
    return route.fulfill({ json: { isAdmin: true } });
  });
  await page.goto('/cli');
  await expect(
    page.locator('a[href="https://admin.agentrepo.dev/api/auth/sso"]'),
  ).toHaveCount(2);
  expect(checks).toBe(1);
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = isMobile
    ? page.locator('#mobile-navigation nav')
    : page.locator('header nav');
  await nav.getByRole('link', { name: 'Agents', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Agents', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Linked project/ }),
  ).toBeVisible();
  expect(checks).toBe(1);
});

test('creators can open Writer before preparing a contribution', async ({
  page,
}) => {
  await page.goto('/creator');
  const writer = page.getByRole('link', { name: 'Writer', exact: true });
  await expect(writer).toHaveAttribute('href', '/skills/writer');
  await writer.click();
  await expect(page).toHaveURL(/\/skills\/writer$/);
});

import { expect, test } from '@playwright/test';

test('editorial review requires a session', async ({ page }) => {
  await page.goto('http://localhost:3001/admin/review');
  await expect(page).toHaveURL(/\/login\?from=/);
  await expect(
    page.getByRole('heading', { name: 'Admin access' }),
  ).toBeVisible();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});

test('admin sign in recovers after a network failure', async ({ page }) => {
  await page.goto('http://localhost:3001/login');
  await page.route('**/api/auth/login', (route) => route.abort('failed'));
  await page.getByLabel('Email', { exact: true }).fill('ui-test@example.test');
  await page
    .getByLabel('Password', { exact: true })
    .fill('synthetic-test-input');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('form').getByRole('alert')).toHaveText(
    'Could not reach the server. Please try again.',
  );
  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

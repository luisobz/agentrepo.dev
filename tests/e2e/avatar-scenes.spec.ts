import { expect, test } from '@playwright/test';

test('contextual actors take turns and restore the floating mascot offscreen', async ({
  page,
}) => {
  await page.goto('/en/agents/linked-project');
  const scene = page.getByTestId('avatar-scene');
  await expect(scene.getByRole('button')).toHaveCount(2);
  await expect(page.getByTestId('avatar-stage')).toHaveCount(0);
  await scene.getByRole('button', { name: 'Development', exact: true }).click();
  await expect(scene.getByRole('status')).toContainText('implementation');
  await scene.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(scene.getByRole('status')).toHaveCount(1);
  await expect(scene.getByRole('status')).toContainText('permissions');
  await expect(scene.locator('svg')).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(page.getByTestId('avatar-stage')).toHaveCount(1);
});

test('a single actor respects reduced motion and native keyboard controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/skills/linked-project/1.0.0');
  const scene = page.getByTestId('avatar-scene');
  await expect(scene.getByRole('button')).toHaveCount(1);
  await expect(scene.locator('svg')).toHaveAttribute('data-animated', 'false');
  await scene.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(scene.getByRole('status')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(scene.getByRole('status')).toHaveCount(0);
});

test('page actors give way to a focused mobile menu', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile interaction');
  await page.goto('/en/agents');
  const scene = page.getByTestId('avatar-scene');
  await expect(page.getByTestId('avatar-stage')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByTestId('avatar-stage')).toHaveCount(1);
  await expect(scene).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(scene).toBeVisible();
  await expect(page.getByTestId('avatar-stage')).toHaveCount(0);
});

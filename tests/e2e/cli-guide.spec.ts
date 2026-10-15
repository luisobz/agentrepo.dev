import { expect, test } from '@playwright/test';

test('main navigation promotes CLI and secondary links stay in the footer', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
  const navigation = isMobile
    ? page.locator('#mobile-navigation nav')
    : page.locator('header nav');
  await expect(
    navigation.getByRole('link', { name: 'Playground', exact: true }),
  ).toHaveCount(0);
  await expect(
    navigation.getByRole('link', { name: 'Portfolio', exact: true }),
  ).toHaveCount(0);
  await navigation.getByRole('link', { name: 'CLI', exact: true }).click();
  await expect(page).toHaveURL(/\/cli$/);
  await expect(
    page.getByRole('heading', { name: 'Skills, pinned to your project.' }),
  ).toBeVisible();
  await expect(page.locator('main')).toContainText('agent.json');
  await expect(page.locator('main')).toContainText(
    'cli-v0.2.1/agentrepo-cli-0.2.1.tgz',
  );
  await expect(page.locator('main')).toContainText('agentrepo skill2');
  await expect(page.locator('main')).toContainText('agentrepo reset --hard');
  await expect(page.locator('main')).not.toContainText('--target');
  await expect(page.locator('main')).not.toContainText('--frozen-lockfile');
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Playground', exact: true }),
  ).toHaveAttribute('href', '/playground');
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Portfolio', exact: true }),
  ).toHaveAttribute('href', '/portfolio/luisbz');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('CLI guide is localized and copies the manifest', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'locale', value: 'es', domain: 'localhost', path: '/' },
  ]);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/cli');
  await expect(
    page.getByRole('heading', { name: 'Skills fijadas a tu proyecto.' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Copiar agent.json', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Copiar agent.json', exact: true }),
  ).toContainText('Copiado');
  expect(
    JSON.parse(await page.evaluate(() => navigator.clipboard.readText())),
  ).toEqual({
    schemaVersion: 1,
    target: 'claude',
    skills: { 'code-review': '1.0.0', 'project-planning': '2.1.0' },
  });
});

test('CLI commands have real line breaks and install and launch copy separately', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/cli');
  const install = page.locator('main pre:visible').filter({ hasText: 'pnpm add -g' });
  await expect(install).not.toContainText('\\n');
  expect(await install.textContent()).not.toContain('\n');
  await expect(
    page.locator('main pre:visible').filter({ hasText: /^agentrepo$/ }),
  ).toHaveCount(1);
  const commands =
    'agentrepo skill2\nagentrepo verify\nagentrepo install\nagentrepo reset --hard';
  await expect(page.locator('main pre[aria-label="Commands"]:visible')).toHaveText(commands);
  await page
    .getByRole('button', { name: 'Copy Commands', exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    commands,
  );
});

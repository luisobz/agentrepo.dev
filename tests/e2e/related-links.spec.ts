import { expect, test } from '@playwright/test';
for (const kind of ['agents', 'skills', 'blog']) {
  test(`${kind} shows labelled project references`, async ({ page }) => {
    await page.goto(`/${kind}/linked-project`);
    const links = page.getByRole('region', { name: 'Related links' });
    await expect(
      links.getByRole('link', { name: /Project source/ }),
    ).toHaveAttribute('href', 'https://github.com/example/project');
    await expect(
      links.getByRole('link', { name: /Creator on X/ }),
    ).toHaveAttribute('rel', 'noopener noreferrer ugc');
    await expect(
      links.getByRole('link', { name: /Documentation/ }),
    ).toBeVisible();
    if (kind === 'agents')
      await expect(
        page.getByRole('heading', {
          name: 'nanobot — guía técnica de instalación, VPS y operación',
          exact: true,
        }),
      ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (kind === 'agents') {
      await expect(
        page.getByText('Documentation comes before the file browser.'),
      ).toBeVisible();
      await expect(page.locator('details')).not.toHaveAttribute('open');
      await page.getByText('Files & downloads', { exact: true }).click();
      await expect(page.locator('details')).toHaveAttribute('open');
    }
  });
}

test('full guide fits a narrow viewport after fonts load', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 950 });
  await page.goto('/agents/linked-project', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole('heading', {
      name: 'nanobot — guía técnica de instalación, VPS y operación',
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

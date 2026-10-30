import { expect, test } from '@playwright/test';

for (const locale of ['es', 'en']) {
  test(`Lazy Read opens with the keyboard in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/blog/linked-project`);
    const panel = page.getByTestId('lazy-read');
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveAttribute('open');
    const trigger = panel.locator('summary');
    await expect(trigger).toContainText(
      locale === 'es' ? 'Un resumen sencillo' : 'A simple summary',
    );
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toHaveAttribute('open', '');
    await expect(panel.locator('p')).toHaveText(
      locale === 'es' ? 'Un artículo enlazado' : 'A linked article',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press('Space');
    await expect(panel).not.toHaveAttribute('open');
  });
}

test('Lazy Read works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/es/blog/linked-project');
  const panel = page.getByTestId('lazy-read');
  await expect(panel).not.toHaveAttribute('open');
  await panel.locator('summary').click();
  await expect(panel).toHaveAttribute('open', '');
  await context.close();
});

import { expect, test } from '@playwright/test';

for (const locale of ['es', 'en']) {
  test(`the hero invites contributions without opening the menu in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    const hero = page
      .locator('section')
      .filter({ has: page.getByTestId('avatar-slot-hero') });
    const invite = hero.getByRole('link', {
      name:
        locale === 'es'
          ? /¿Tienes algo que compartir/
          : /Have something to share/,
    });
    await expect(invite).toBeVisible();
    const sprite = await hero.getByTestId('avatar-slot-hero').boundingBox();
    const bubble = await invite.boundingBox();
    expect(sprite && bubble && bubble.y >= sprite.y + sprite.height).toBe(true);
    if (locale === 'es') {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Menos ruido, más útil',
      );
      await expect(hero).not.toContainText('sin paja');
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await invite.click();
    await expect(page).toHaveURL(/\/creator$/);
  });
}

for (const [path, kind, label] of [
  ['skills', 'skill', 'Propose a skill'],
  ['agents', 'agent', 'Propose an agent'],
  ['blog', 'blog', 'Propose an article'],
]) {
  test(`${path} opens the matching contribution type`, async ({ page }) => {
    await page.goto(`/en/${path}`);
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/creator\\?type=${kind}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(label);
    await expect(
      page.getByRole('button', { name: 'Connect with GitHub' }),
    ).toBeVisible();
  });
}

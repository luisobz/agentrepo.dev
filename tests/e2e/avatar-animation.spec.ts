import { expect, test, type Page } from '@playwright/test';

async function distanceToSlot(page: Page, id: string) {
  const avatar = await page.getByTestId('avatar-sprite').boundingBox();
  const slot = await page
    .locator(`[data-testid="avatar-slot-${id}"][data-active="true"] > div`)
    .evaluateAll((elements) => {
      if (elements.length !== 1) return null;
      const rect = elements[0].getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
  if (!avatar || !slot) return Infinity;
  return (
    Math.abs(avatar.x + avatar.width / 2 - slot.x - slot.width / 2) +
    Math.abs(avatar.y + avatar.height / 2 - slot.y - slot.height / 2)
  );
}

test('avatar animates in place and follows an ancestor transition', async ({
  page,
}) => {
  await page.goto('/');
  await expect.poll(() => distanceToSlot(page, 'hero')).toBeLessThan(4);
  const figure = page.getByTestId('avatar-pixel-art');
  await expect(figure).toHaveAttribute('data-clip', 'idle');
  const first = await figure.getAttribute('data-frame');
  await expect.poll(() => figure.getAttribute('data-frame')).not.toBe(first);
  await page.getByTestId('avatar-slot-hero').evaluate((el) => {
    el.style.transition = 'transform 900ms linear';
    el.style.transform = 'translateX(64px)';
  });
  await page.waitForTimeout(450);
  expect(await distanceToSlot(page, 'hero')).toBeLessThan(5);
  await expect.poll(() => distanceToSlot(page, 'hero')).toBeLessThan(4);
});

test('reduced motion cancels an ongoing flight and keeps the figure static', async ({
  page,
}) => {
  await page.goto('/');
  await expect.poll(() => distanceToSlot(page, 'hero')).toBeLessThan(4);
  await page.getByRole('button', { name: 'Open search', exact: true }).click();
  const avatar = page.getByTestId('avatar-sprite');
  await expect(avatar).toHaveAttribute('data-travel', 'fly');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(avatar).toHaveAttribute('data-travel', 'none');
  await expect(page.getByTestId('avatar-pixel-art')).toHaveAttribute(
    'data-animated',
    'false',
  );
  await expect.poll(() => distanceToSlot(page, 'search')).toBeLessThan(4);
  const frame = await page
    .getByTestId('avatar-pixel-art')
    .getAttribute('data-frame');
  await page.waitForTimeout(500);
  expect(
    await page.getByTestId('avatar-pixel-art').getAttribute('data-frame'),
  ).toBe(frame);
});

test('mobile menu docks the animated avatar above its navigation links', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile drawer');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect.poll(() => distanceToSlot(page, 'mobile-menu')).toBeLessThan(4);
  const avatar = await page.getByTestId('avatar-sprite').boundingBox();
  const link = await page
    .locator('#mobile-navigation')
    .getByRole('link', { name: 'Skills', exact: true })
    .boundingBox();
  expect(avatar).not.toBeNull();
  expect(link).not.toBeNull();
  if (avatar && link) expect(avatar.y + avatar.height).toBeLessThan(link.y);
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-navigation')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('the header returns when contextual actors leave the mobile viewport', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile fallback');
  await page.goto('/agents');
  await expect(page.getByTestId('avatar-scene')).toBeVisible();
  await expect(page.getByTestId('avatar-stage')).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(page.getByTestId('avatar-sprite')).toBeVisible();
  await expect.poll(() => distanceToSlot(page, 'header')).toBeLessThan(4);
});

test('Spanish search is localized and its avatar message leaves instructions clear', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'locale', value: 'es', domain: 'localhost', path: '/' },
  ]);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open search', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByPlaceholder('Busca skills, agentes y artículos…'),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      'Escribe al menos 2 caracteres para buscar en todo el sitio.',
    ),
  ).toBeVisible();
  await expect(dialog.getByText('↑↓ navegar')).toBeVisible();
  await expect
    .poll(async () => {
      const bubble = await page.getByTestId('avatar-bubble').boundingBox();
      const box = await dialog
        .getByText(
          'Escribe al menos 2 caracteres para buscar en todo el sitio.',
        )
        .boundingBox();
      return bubble && box ? bubble.y + bubble.height <= box.y : false;
    })
    .toBe(true);
});

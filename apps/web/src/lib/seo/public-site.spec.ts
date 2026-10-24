import { expect, it } from 'vitest';
import { isPublicPage } from './public-site';
it.each([
  '/skills/private',
  '/skills/private/',
  '/skills/private/new',
  '/skills/private/id',
  '/skills/private/id/edit',
])('excludes private skills from public analytics: %s', (path) =>
  expect(isPublicPage(path)).toBe(false),
);
it.each(['/skills', '/skills/public-example'])(
  'retains public skill analytics: %s',
  (path) => expect(isPublicPage(path)).toBe(true),
);

it('measures versioned public releases while excluding private skills', () =>
  expect(isPublicPage('/skills/writer/1.0.0')).toBe(true));

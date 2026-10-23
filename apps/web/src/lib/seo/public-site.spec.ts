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

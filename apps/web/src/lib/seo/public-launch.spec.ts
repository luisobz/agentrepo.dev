import { describe, expect, it } from 'vitest';
import robots from '../../app/robots';
import { PUBLIC_SITE_METADATA, isPublicPage } from './public-site';
describe('public launch metadata', () => {
  it('allows indexing and offers a raster share image', () => {
    expect(PUBLIC_SITE_METADATA.robots).toEqual({ index: true, follow: true });
    expect(JSON.stringify(PUBLIC_SITE_METADATA.openGraph)).toContain(
      '/og-cover.jpg',
    );
  });
  it('keeps account, API and portfolio routes outside public measurement', () => {
    for (const route of [
      '/auth/callback',
      '/creator',
      '/api/creator/submit',
      '/portfolio/luisbz',
      '/admin',
    ])
      expect(isPublicPage(route)).toBe(false);
    for (const route of [
      '/',
      '/skills',
      '/skills/writer',
      '/agents/linux-agent',
      '/cli',
      '/blog',
    ])
      expect(isPublicPage(route)).toBe(true);
  });
  it('disallows sensitive routes for crawlers', () => {
    expect(JSON.stringify(robots().rules)).toContain('/creator');
    expect(JSON.stringify(robots().rules)).toContain('/api/');
  });
});

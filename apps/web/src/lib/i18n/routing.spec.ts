import { describe, expect, it } from 'vitest';
import { detectLocale, localizedHref, splitLocalePath } from './routing';

describe('language routing', () => {
  it.each([
    ['es-ES,es;q=0.9,en;q=0.8', 'es'],
    ['en-GB,en;q=0.9,es;q=0.2', 'en'],
    ['fr,es-MX;q=0.8,en;q=0.6', 'es'],
    ['es;q=0,en;q=0.3', 'en'],
    ['fr,de', 'en'],
    [null, 'en'],
  ])('negotiates browser preferences %s', (header, locale) => {
    expect(detectLocale(null, header)).toBe(locale);
  });
  it('honors a deliberate saved language', () => {
    expect(detectLocale('es', 'en-US')).toBe('es');
    expect(detectLocale('invalid', 'es')).toBe('es');
  });
  it('separates explicit language from the actual route', () => {
    expect(splitLocalePath('/es/blog/example')).toEqual({
      locale: 'es',
      pathname: '/blog/example',
    });
    expect(splitLocalePath('/en')).toEqual({ locale: 'en', pathname: '/' });
    expect(splitLocalePath('/esoteric')).toEqual({
      locale: null,
      pathname: '/esoteric',
    });
  });
  it('preserves pinned versions, queries and fragments when localizing', () => {
    expect(localizedHref('/skills/writer/0.1.0?x=1#files', 'es')).toBe(
      '/es/skills/writer/0.1.0?x=1#files',
    );
    expect(localizedHref('/en/blog/example', 'es')).toBe('/es/blog/example');
    expect(localizedHref('/', 'en')).toBe('/en');
  });
  it.each([
    '/api/creator/submit',
    '/auth/github',
    '/skills/private/secret',
    '/skills/%70rivate/secret',
    '/blog/%72eview/secret',
    '/blog/review/secret',
    '/creator',
    '/og-cover.jpg',
    '//external.test/blog',
    'https://external.test/blog',
    '#section',
  ])('does not localize operational or private URLs %s', (href) => {
    expect(localizedHref(href, 'es')).toBe(href);
  });
});

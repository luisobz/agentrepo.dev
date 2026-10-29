import { isLocale, type Locale } from '@agentrepo/ui';

export const REQUEST_LOCALE = 'x-agentrepo-locale';
export const REQUEST_PATH = 'x-agentrepo-public-path';

export function splitLocalePath(path: string): {
  locale: Locale | null;
  pathname: string;
} {
  const match = /^\/(en|es)(?=\/|$)/.exec(path);
  return match
    ? {
        locale: match[1] as Locale,
        pathname: path.slice(match[0].length) || '/',
      }
    : { locale: null, pathname: path };
}

export function isLocalizedPage(path: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (/^\/(skills\/private|blog\/review)(\/|$)/.test(decoded)) return false;
  if (path.split('/').some((part) => /[/\\]/.test(decodeURIComponent(part))))
    return false;
  return (
    path === '/' ||
    /^\/(skills|agents|blog)(\/[^/]+)?\/?$/.test(path) ||
    /^\/skills\/[^/]+\/[^/]+\/?$/.test(path) ||
    /^\/(cli|privacy|terms)\/?$/.test(path)
  );
}

export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const boundary = href.search(/[?#]/);
  const path = boundary < 0 ? href : href.slice(0, boundary);
  const suffix = boundary < 0 ? '' : href.slice(boundary);
  const { pathname } = splitLocalePath(path);
  if (!isLocalizedPage(pathname)) return href;
  return `/${locale}${pathname === '/' ? '' : pathname}${suffix}`;
}

export function detectLocale(
  saved: unknown,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(saved)) return saved;
  const candidates = (acceptLanguage ?? '')
    .split(',')
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(';');
      const quality = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      );
      return {
        tag: tag.split('-')[0],
        quality: quality ? Number(quality.trim().slice(2)) : 1,
        index,
      };
    })
    .filter(
      ({ quality }) => Number.isFinite(quality) && quality > 0 && quality <= 1,
    )
    .sort(
      (left, right) => right.quality - left.quality || left.index - right.index,
    );
  return (
    (candidates.find(({ tag }) => isLocale(tag))?.tag as Locale | undefined) ??
    'en'
  );
}

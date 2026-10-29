import type { Locale } from '@agentrepo/ui';
import { localizedHref } from '../i18n/routing';
import { SITE_URL } from './public-site';

export function localizedAlternates(path: string, locale: Locale) {
  return {
    canonical: SITE_URL + localizedHref(path, locale),
    languages: {
      es: SITE_URL + localizedHref(path, 'es'),
      en: SITE_URL + localizedHref(path, 'en'),
      'x-default': SITE_URL + localizedHref(path, 'en'),
    },
  };
}

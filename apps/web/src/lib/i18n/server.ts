import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  translate,
  type Locale,
} from '@agentrepo/ui';
import { cookies } from 'next/headers';
import { webDictionary, type WebDictionaryKey } from './dictionary';

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Server-side translator bound to the request locale. */
export async function getServerT(): Promise<(key: WebDictionaryKey) => string> {
  const locale = await getServerLocale();
  return (key) => translate(webDictionary, locale, key);
}

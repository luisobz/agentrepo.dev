import { isLocale, LOCALE_COOKIE, translate, type Locale } from '@agentrepo/ui';
import { cookies, headers } from 'next/headers';
import { detectLocale, REQUEST_LOCALE } from './routing';
import { webDictionary, type WebDictionaryKey } from './dictionary';

export async function getServerLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const explicit = requestHeaders.get(REQUEST_LOCALE);
  if (isLocale(explicit)) return explicit;
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return detectLocale(value, requestHeaders.get('accept-language'));
}

/** Server-side translator bound to the request locale. */
export async function getServerT(): Promise<(key: WebDictionaryKey) => string> {
  const locale = await getServerLocale();
  return (key) => translate(webDictionary, locale, key);
}

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'es';
}

/** Per-app dictionaries: every UI string keyed once, translated per locale. */
export type Dictionary<TKey extends string = string> = Record<
  TKey,
  Record<Locale, string>
>;

export function translate<TKey extends string>(
  dictionary: Dictionary<TKey>,
  locale: Locale,
  key: TKey
): string {
  return dictionary[key]?.[locale] ?? dictionary[key]?.[DEFAULT_LOCALE] ?? key;
}

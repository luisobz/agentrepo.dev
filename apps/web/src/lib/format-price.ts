import type { Locale } from '@agentrepo/ui';

export function formatPrice(
  priceCents: number,
  currency: string,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100);
}

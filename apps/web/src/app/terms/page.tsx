import { getServerLocale } from '../../lib/i18n/server';
import { localizedAlternates } from '../../lib/seo/localized-metadata';
import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal/legal-page';
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title:
      locale === 'es'
        ? 'Condiciones y contribuciones'
        : 'Terms and contributions',
    alternates: localizedAlternates('/terms', locale),
  };
}
export default function Page() {
  return <LegalPage kind="terms" />;
}

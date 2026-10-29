import { getServerLocale } from '../../lib/i18n/server';
import { localizedAlternates } from '../../lib/seo/localized-metadata';
import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal/legal-page';
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: locale === 'es' ? 'Privacidad' : 'Privacy',
    alternates: localizedAlternates('/privacy', locale),
  };
}
export default function Page() {
  return <LegalPage kind="privacy" />;
}

import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal/legal-page';
export const metadata: Metadata = {
  title: 'Privacy',
  alternates: { canonical: '/privacy' },
};
export default function Page() {
  return <LegalPage kind="privacy" />;
}

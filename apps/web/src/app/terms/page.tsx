import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal/legal-page';
export const metadata: Metadata = {
  title: 'Terms and contributions',
  alternates: { canonical: '/terms' },
};
export default function Page() {
  return <LegalPage kind="terms" />;
}

import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };
import { ContributorLogin } from '../../../components/creator/contributor-login';

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-24">
      <ContributorLogin />
    </div>
  );
}

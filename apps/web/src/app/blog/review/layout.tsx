import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Blog review | AgentRepo.dev',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function BlogReviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

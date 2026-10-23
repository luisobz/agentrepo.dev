import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Private skills | AgentRepo.dev',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function PrivateSkillsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <section className="mx-auto max-w-3xl px-4 pb-24">{children}</section>;
}

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@agentrepo/ui/styles/globals.css';
import { TRPCProvider } from '../components/providers/trpc-provider';
import { Header } from '../components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentRepo.dev | AI Development Repository & Portfolio',
  description: 'Clean coding, AI subagents, and development assets for professional builders. Built by Luis Ballester Zafra.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        {/* Subtle global grid pattern background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.4] bg-[radial-gradient(var(--color-border-soft)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <TRPCProvider>
          <Header />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
        </TRPCProvider>
      </body>
    </html>
  );
}

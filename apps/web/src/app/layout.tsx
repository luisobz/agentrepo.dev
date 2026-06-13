import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@agentrepo/ui/styles/globals.css';
import { TRPCProvider } from '../components/providers/trpc-provider';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { CommandPalette } from '../components/search/command-palette';
import { CommandPaletteProvider } from '../components/search/command-palette-provider';
import { AvatarProvider } from '@agentrepo/avatar';
import { LocaleProvider } from '@agentrepo/ui';
import { getServerLocale } from '../lib/i18n/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentRepo.dev | AI Development Repository & Portfolio',
  description: 'Clean coding, AI subagents, and development assets for professional builders. Built by Luis Ballester Zafra.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        {/* Subtle global grid pattern background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.4] bg-[radial-gradient(var(--color-border-soft)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <LocaleProvider initialLocale={locale}>
        <TRPCProvider>
          <AvatarProvider>
            <CommandPaletteProvider>
              <Header />
              <main className="pt-24 min-h-screen">
                {children}
              </main>
              <Footer />
              <CommandPalette />
            </CommandPaletteProvider>
          </AvatarProvider>
        </TRPCProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

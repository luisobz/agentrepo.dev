import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@agentrepo/ui/styles/globals.css';
import { TRPCProvider } from '../components/providers/trpc-provider';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LocaleProvider } from '@agentrepo/ui';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentRepo Admin',
  description: 'Admin panel',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased min-h-screen">
        <LocaleProvider initialLocale={locale}>
          <TRPCProvider>{children}</TRPCProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

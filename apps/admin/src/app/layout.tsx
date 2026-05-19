import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@agentrepo/ui/styles/globals.css';
import { TRPCProvider } from '../components/providers/trpc-provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentRepo Admin',
  description: 'Admin panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased min-h-screen">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}

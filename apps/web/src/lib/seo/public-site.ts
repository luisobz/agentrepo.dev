import type { Metadata } from 'next';
export const SITE_URL = 'https://agentrepo.dev';
export const SHARE_IMAGE = {
  url: '/og-cover.jpg',
  width: 1280,
  height: 672,
  alt: 'AgentRepo.dev — Discover, learn and build with AI skills and agents',
};
export function isPublicPage(path: string): boolean {
  if (path === '/skills/private' || path.startsWith('/skills/private/'))
    return false;
  if (path === '/blog/review' || path.startsWith('/blog/review/')) return false;
  return (
    path === '/' ||
    /^\/skills\/[^/]+\/\d+\.\d+\.\d+\/?$/.test(path) ||
    /^\/(skills|agents|blog)(\/[^/]+)?\/?$/.test(path) ||
    /^\/(cli|privacy|terms)\/?$/.test(path)
  );
}
const description =
  'Discover reusable AI skills, agent projects and practical guides. Install versioned skills with the interactive AgentRepo CLI.';
export const PUBLIC_SITE_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AgentRepo.dev — AI skills and agents',
    template: '%s | AgentRepo.dev',
  },
  description,
  authors: [{ name: 'Luis Ballester Zafra', url: SITE_URL }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'AgentRepo.dev',
    title: 'AgentRepo.dev — AI skills and agents',
    description,
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentRepo.dev — AI skills and agents',
    description,
    images: [SHARE_IMAGE.url],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/icon.png',
  },
  robots: { index: true, follow: true },
};

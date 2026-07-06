import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The portfolio is unlocked through the avatar easter egg.
        disallow: ['/portfolio/', '/auth/'],
      },
    ],
    sitemap: 'https://agentrepo.dev/sitemap.xml',
  };
}

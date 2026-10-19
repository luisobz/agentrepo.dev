'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isPublicPage } from '../../lib/seo/public-site';

export function WebAnalytics() {
  const pathname = usePathname();
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  useEffect(() => {
    if (!token || !isPublicPage(window.location.pathname)) return;
    // End the public measurement document before entering account/private surfaces.
    const leavePublic = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href]')
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target ||
        link.hasAttribute('download')
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin === window.location.origin &&
        !isPublicPage(url.pathname)
      ) {
        event.preventDefault();
        event.stopPropagation();
        window.location.assign(url.href);
      }
    };
    document.addEventListener('click', leavePublic, true);
    return () => document.removeEventListener('click', leavePublic, true);
  }, [token, pathname]);
  if (!token || !/^[a-f0-9]{32}$/.test(token) || !isPublicPage(pathname ?? ''))
    return null;
  return (
    <Script
      id="cloudflare-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token, spa: true })}
    />
  );
}

'use client';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useLocale } from '@agentrepo/ui';
import { localizedHref } from '../lib/i18n/routing';

export default function LocalizedLink({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const { locale } = useLocale();
  const target =
    typeof href === 'string'
      ? localizedHref(href, locale)
      : {
          ...href,
          pathname: href.pathname
            ? localizedHref(href.pathname, locale)
            : href.pathname,
        };
  return <NextLink {...props} href={target} />;
}

'use client';
import { CharacterFigure } from '@agentrepo/avatar';
import { useEffect, useRef, useState } from 'react';
import Link from './localized-link';
export function TrendingIndicator({ locale }: { locale: 'es' | 'en' }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <Link
      ref={ref}
      href="/#trending"
      data-testid="trending-indicator"
      className="my-3 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-soft)] px-3 py-1 text-sm font-medium text-[var(--color-brand-garnet)]"
    >
      <CharacterFigure character="trending" size={40} playing={visible} />
      {locale === 'es' ? 'En tendencia esta semana' : 'Trending this week'}
    </Link>
  );
}

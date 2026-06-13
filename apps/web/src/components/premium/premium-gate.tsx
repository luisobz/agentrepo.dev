'use client';

import { MarkdownContent, useLocale } from '@agentrepo/ui';
import { Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../lib/format-price';
import { useT } from '../../lib/i18n/use-t';

interface PremiumGateProps {
  priceCents: number | null;
  currency: string;
  previewContent: string | null;
}

/**
 * Paywall for premium assets: shows the public teaser and the buy action.
 * Checkout itself ships with the payments feature; the CTA is mocked.
 */
export function PremiumGate({ priceCents, currency, previewContent }: PremiumGateProps) {
  const t = useT();
  const { locale } = useLocale();
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  return (
    <section className="rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)]">
      {previewContent && (
        <div className="border-b border-[var(--color-border-soft)] p-6 sm:p-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {t('premium.preview')}
          </p>
          <MarkdownContent content={previewContent} />
        </div>
      )}

      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]">
          <Lock className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold">{t('premium.locked.title')}</h2>
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
          {t('premium.locked.body')}
        </p>
        <button
          type="button"
          onClick={() => setShowCheckoutNotice(true)}
          className="mt-2 flex items-center gap-2 rounded-xl bg-[var(--color-brand-garnet)] px-6 py-3 text-sm font-semibold text-[var(--color-bg-warm-white)] shadow-[var(--shadow-garnet)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-brand-garnet-deep)]"
        >
          <Sparkles className="h-4 w-4" />
          {t('premium.buy')}
          {priceCents != null && (
            <span className="font-mono">
              · {formatPrice(priceCents, currency, locale)}
            </span>
          )}
        </button>
        {showCheckoutNotice && (
          <p role="status" className="max-w-sm text-xs text-[var(--color-text-muted)]">
            {t('premium.checkoutSoon')}
          </p>
        )}
      </div>
    </section>
  );
}

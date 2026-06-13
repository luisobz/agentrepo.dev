'use client';

import { Input } from '@agentrepo/ui';
import { FormField } from './form-field';
import { MonacoField } from './monaco-field';

export interface PremiumFormValues {
  headerImageUrl: string;
  isPremium: boolean;
  price: string; // decimal text, converted to cents on submit
  currency: 'EUR' | 'USD';
  previewContent: string;
}

export const EMPTY_PREMIUM_VALUES: PremiumFormValues = {
  headerImageUrl: '',
  isPremium: false,
  price: '',
  currency: 'EUR',
  previewContent: '',
};

export function premiumValuesFrom(asset?: {
  headerImageUrl: string | null;
  isPremium: boolean;
  priceCents: number | null;
  currency: string;
  previewContent: string | null;
}): PremiumFormValues {
  if (!asset) {
    return EMPTY_PREMIUM_VALUES;
  }
  return {
    headerImageUrl: asset.headerImageUrl ?? '',
    isPremium: asset.isPremium,
    price: asset.priceCents != null ? (asset.priceCents / 100).toFixed(2) : '',
    currency: asset.currency === 'USD' ? 'USD' : 'EUR',
    previewContent: asset.previewContent ?? '',
  };
}

/** Converts the form values into the API payload fields. */
export function premiumPayloadFrom(values: PremiumFormValues) {
  return {
    headerImageUrl: values.headerImageUrl.trim() || null,
    isPremium: values.isPremium,
    priceCents: values.isPremium
      ? Math.round(Number.parseFloat(values.price) * 100) || null
      : null,
    currency: values.currency,
    previewContent: values.isPremium
      ? values.previewContent.trim() || null
      : null,
  };
}

interface PremiumFieldsSectionProps {
  values: PremiumFormValues;
  onChange: (patch: Partial<PremiumFormValues>) => void;
}

export function PremiumFieldsSection({ values, onChange }: PremiumFieldsSectionProps) {
  return (
    <div className="flex flex-col gap-5 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/40 p-5">
      <FormField
        label="Header image URL (optional)"
        htmlFor="headerImageUrl"
        hint="Leave empty to use the generated cover template"
      >
        <Input
          id="headerImageUrl"
          type="url"
          placeholder="https://…"
          value={values.headerImageUrl}
          onChange={(event) => onChange({ headerImageUrl: event.target.value })}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={values.isPremium}
          onChange={(event) => onChange({ isPremium: event.target.checked })}
          className="h-4 w-4 accent-[var(--color-brand-garnet)]"
        />
        Premium asset (paid access)
      </label>

      {values.isPremium && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Price" htmlFor="price" hint="e.g. 19.99">
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={values.price}
                onChange={(event) => onChange({ price: event.target.value })}
                required
              />
            </FormField>
            <FormField label="Currency" htmlFor="currency">
              <select
                id="currency"
                value={values.currency}
                onChange={(event) =>
                  onChange({
                    currency: event.target.value === 'USD' ? 'USD' : 'EUR',
                  })
                }
                className="flex w-full rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-[14px] py-[10px] text-[15px] text-[var(--color-text-primary)] focus-visible:border-[var(--color-brand-garnet)] focus-visible:outline-none"
              >
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </select>
            </FormField>
          </div>
          <MonacoField
            label="Public preview (Markdown, shown before purchase)"
            language="markdown"
            value={values.previewContent}
            onChange={(previewContent) => onChange({ previewContent })}
            height="220px"
          />
        </>
      )}
    </div>
  );
}

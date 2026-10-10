'use client';

import {
  ExternalLink,
  Code2,
  Globe,
  MessageCircle,
  BookOpen,
  Video,
  Plus,
  Trash2,
} from 'lucide-react';
import { useLocale } from '../../i18n/locale';

const kinds = [
  'website',
  'github',
  'x',
  'documentation',
  'community',
  'video',
  'other',
] as const;
export type ContentRelatedLink = {
  kind: (typeof kinds)[number];
  label: string;
  url: string;
};
const names = {
  website: ['Website', 'Web'],
  github: ['GitHub', 'GitHub'],
  x: ['X', 'X'],
  documentation: ['Documentation', 'Documentación'],
  community: ['Community', 'Comunidad'],
  video: ['Video', 'Vídeo'],
  other: ['Reference', 'Referencia'],
};
const icons = {
  website: Globe,
  github: Code2,
  x: MessageCircle,
  documentation: BookOpen,
  community: MessageCircle,
  video: Video,
  other: ExternalLink,
};

export function RelatedLinks({ links = [] }: { links?: ContentRelatedLink[] }) {
  const { locale } = useLocale();
  if (!links.length) return null;
  return (
    <section
      className="my-6"
      aria-label={locale === 'es' ? 'Enlaces relacionados' : 'Related links'}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {locale === 'es' ? 'Enlaces relacionados' : 'Related links'}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = icons[link.kind];
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-3 transition-colors hover:border-[var(--color-brand-garnet)]"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-garnet)]"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-semibold">
                  {link.label}
                </span>
                <span className="block truncate text-xs text-[var(--color-text-muted)]">
                  {new URL(link.url).hostname}
                </span>
              </span>
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function RelatedLinksEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: ContentRelatedLink[];
  onChange: (value: ContentRelatedLink[]) => void;
  disabled?: boolean;
}) {
  const { locale } = useLocale();
  const es = locale === 'es';
  const update = (index: number, patch: Partial<ContentRelatedLink>) =>
    onChange(
      value.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  const inputClass =
    'min-w-0 w-full rounded-lg border border-[var(--color-border-medium)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)]';
  return (
    <fieldset
      disabled={disabled}
      className="space-y-3 rounded-xl border border-[var(--color-border-soft)] p-4"
    >
      <legend className="px-1 text-sm font-semibold">
        {es ? 'Enlaces relacionados' : 'Related links'}
      </legend>
      <p className="text-xs text-[var(--color-text-muted)]">
        {es
          ? 'Web, GitHub, X, documentación, comunidad y otras referencias. Hasta 12 enlaces HTTPS.'
          : 'Website, GitHub, X, documentation, community and other references. Up to 12 HTTPS links.'}
      </p>
      {value.map((link, index) => (
        <div
          key={index}
          className="grid min-w-0 grid-cols-1 gap-2 rounded-lg bg-[var(--color-bg-surface)] p-3 sm:grid-cols-[8rem_1fr_auto]"
        >
          <label className="text-xs">
            {es ? 'Tipo' : 'Type'}
            <select
              aria-label={`${es ? 'Tipo de enlace' : 'Link type'} ${index + 1}`}
              className={inputClass}
              value={link.kind}
              onChange={(e) => {
                const kind = kinds.find((kind) => kind === e.target.value);
                if (kind) update(index, { kind });
              }}
            >
              {kinds.map((kind) => (
                <option key={kind} value={kind}>
                  {names[kind][es ? 1 : 0]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            {es ? 'Etiqueta' : 'Label'}
            <input
              aria-label={`${es ? 'Etiqueta del enlace' : 'Link label'} ${index + 1}`}
              className={inputClass}
              value={link.label}
              onChange={(e) => update(index, { label: e.target.value })}
              maxLength={100}
              required
            />
          </label>
          <button
            type="button"
            aria-label={`${es ? 'Eliminar enlace' : 'Remove link'} ${index + 1}`}
            className="self-end rounded-lg p-2"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <label className="min-w-0 text-xs sm:col-span-3">
            URL
            <input
              aria-label={`Link URL ${index + 1}`}
              className={inputClass}
              type="url"
              placeholder="https://"
              value={link.url}
              onChange={(e) => update(index, { url: e.target.value })}
              maxLength={1000}
              required
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        disabled={value.length >= 12}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-garnet)] disabled:opacity-50"
        onClick={() =>
          onChange([...value, { kind: 'website', label: '', url: '' }])
        }
      >
        <Plus className="h-4 w-4" />
        {es ? 'Añadir enlace' : 'Add link'}
      </button>
    </fieldset>
  );
}

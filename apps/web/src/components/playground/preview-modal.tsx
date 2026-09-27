'use client';

import { X } from 'lucide-react';
import { useT } from '../../lib/i18n/use-t';
import type { PlaygroundCardData } from './playground-types';

function DarkHeroPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a09] p-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[#c4909a]">
        agentrepo.dev · demo
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#fdf8ef]">
        Ship AI agents in style
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#8d8273]">
        A premium dark hero built live by CoderAgent, with gradients tuned to
        the design system.
      </p>
      <button
        type="button"
        className="mt-5 rounded-xl bg-gradient-to-r from-[#7a2230] to-[#5b1822] px-5 py-2.5 text-sm font-semibold text-[#fdf8ef] transition-transform hover:-translate-y-0.5"
      >
        Get started
      </button>
    </div>
  );
}

function OAuthFlowPreview() {
  return (
    <div className="rounded-xl bg-[#12100e] p-8">
      <div className="mx-auto max-w-xs rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <h3 className="text-lg font-semibold text-[#fdf8ef]">Sign in</h3>
        <p className="mt-1 text-xs text-[#8d8273]">
          Secure OAuth with rotating state tokens
        </p>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#fdf8ef] transition-colors hover:bg-white/[0.12]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Continue with GitHub
        </button>
        <p className="mt-3 text-[10px] text-emerald-300">
          ✓ state verified · ✓ PKCE enabled
        </p>
      </div>
    </div>
  );
}

function RedisCachePreview() {
  const rows = [
    { key: 'skills:list:p1', hit: true, ms: 2 },
    { key: 'agents:detail:review-bot', hit: true, ms: 3 },
    { key: 'blog:list:p1', hit: false, ms: 87 },
  ];
  return (
    <div className="rounded-xl bg-[#0e1210] p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
        Cache monitor
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-4 py-2.5 font-mono text-xs last:border-0"
          >
            <span className="text-[#cfc6b8]">{row.key}</span>
            <span className={row.hit ? 'text-emerald-300' : 'text-amber-300'}>
              {row.hit ? `HIT · ${row.ms}ms` : `MISS · ${row.ms}ms`}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#8d8273]">
        97.4% hit ratio in the last hour — powered by the new Redis layer.
      </p>
    </div>
  );
}

function SearchPalettePreview() {
  return (
    <div className="rounded-xl bg-[#12100e] p-8">
      <div className="mx-auto max-w-sm rounded-xl border border-white/15 bg-[#211a1a] p-4 shadow-xl">
        <p className="text-sm text-[#fdf8ef]">⌕ Search skills and agents</p>
        <div className="mt-3 rounded-lg border border-[#c4909a]/40 bg-[#7a2230]/20 px-3 py-2 text-xs text-[#e8c2ca]">
          ↵ Open accessible result
        </div>
        <p className="mt-3 text-xs text-[#8d8273]">
          Keyboard navigation · clear focus · screen reader labels
        </p>
      </div>
    </div>
  );
}

function RealCodePreview({ card }: { card: PlaygroundCardData }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      {card.summary ? (
        <p className="text-sm text-[#cfc6b8]">{card.summary}</p>
      ) : null}
      <pre className="max-h-[50vh] overflow-auto rounded-xl border border-white/10 bg-[#0c0a09] p-4 font-mono text-xs leading-relaxed text-[#e6dfd2]">
        <code>{card.code}</code>
      </pre>
      <button
        type="button"
        onClick={() => {
          if (card.code) {
            void navigator.clipboard.writeText(card.code);
          }
        }}
        className="self-end rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#cfc6b8] transition-colors hover:bg-white/[0.08]"
      >
        {t('playground.copyCode')}
      </button>
    </div>
  );
}

export interface PreviewModalProps {
  card: PlaygroundCardData;
  onClose: () => void;
}

export function PreviewModal({ card, onClose }: PreviewModalProps) {
  const t = useT();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${t('playground.previewOf')} ${card.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1b1714] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#fdf8ef]">{card.title}</h3>
          <button
            type="button"
            aria-label={t('playground.closePreview')}
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8d8273] transition-colors hover:bg-white/[0.08] hover:text-[#fdf8ef]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {card.kind === 'real' && card.code ? (
          <RealCodePreview card={card} />
        ) : card.previewId === 'oauth-flow' ? (
          <OAuthFlowPreview />
        ) : card.previewId === 'redis-cache' ? (
          <RedisCachePreview />
        ) : card.previewId === 'search-palette' ? (
          <SearchPalettePreview />
        ) : (
          <DarkHeroPreview />
        )}
      </div>
    </div>
  );
}

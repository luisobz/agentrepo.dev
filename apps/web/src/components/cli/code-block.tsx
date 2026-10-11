'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useT } from '../../lib/i18n/use-t';

export function CodeBlock({ code, label }: { code: string; label: string }) {
  const t = useT();
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-4 py-2">
        <span className="font-mono text-xs text-[var(--color-text-muted)]">
          {label}
        </span>
        <button
          type="button"
          aria-label={`${t('cli.copy')} ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus('copied');
            } catch {
              setStatus('failed');
            }
          }}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium hover:bg-[var(--color-bg-surface)]"
        >
          {status === 'copied' ? <Check size={14} /> : <Copy size={14} />}
          <span aria-live="polite">
            {t(
              status === 'copied'
                ? 'cli.copied'
                : status === 'failed'
                  ? 'cli.copyFailed'
                  : 'cli.copy',
            )}
          </span>
        </button>
      </div>
      <pre
        className="max-w-full overflow-x-auto p-4 text-sm leading-7"
        tabIndex={0}
        aria-label={label}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

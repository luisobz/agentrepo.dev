'use client';

export type FormView = 'edit' | 'summary' | 'page';

const LABELS: Record<FormView, string> = {
  edit: 'Edit',
  summary: 'Preview summary',
  page: 'Preview page',
};

export function ViewSwitch({
  view,
  onChange,
}: {
  view: FormView;
  onChange: (view: FormView) => void;
}) {
  return (
    <div role="tablist" className="flex w-fit rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-1">
      {(Object.keys(LABELS) as FormView[]).map((candidate) => (
        <button
          key={candidate}
          type="button"
          role="tab"
          aria-selected={view === candidate}
          onClick={() => onChange(candidate)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === candidate
              ? 'bg-[var(--color-bg-warm-white)] text-[var(--color-brand-garnet)] shadow-[var(--shadow-xs)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          {LABELS[candidate]}
        </button>
      ))}
    </div>
  );
}

'use client';
import { FormField } from './form-field';

export function LazyReadFields({
  summary,
  points,
  onSummary,
  onPoints,
  prefix = 'original',
  disabled = false,
}: {
  summary: string;
  points: string;
  onSummary: (value: string) => void;
  onPoints: (value: string) => void;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="flex flex-col gap-3 rounded-xl border border-[var(--color-border-soft)] p-4"
    >
      <legend className="px-2 font-semibold">Lazy Read</legend>
      <FormField
        label="Simple summary / Resumen sencillo"
        htmlFor={`${prefix}-lazy-summary`}
        hint="Explain the main idea in plain language. Preserve important uncertainty and conditions."
      >
        <textarea
          id={`${prefix}-lazy-summary`}
          value={summary}
          onChange={(event) => onSummary(event.target.value)}
          maxLength={1200}
          rows={4}
          className="w-full rounded-md border bg-transparent p-2"
        />
      </FormField>
      <FormField
        label="Key points / Puntos clave"
        htmlFor={`${prefix}-lazy-points`}
        hint="Up to three short points, one per line (120 characters each)."
      >
        <textarea
          id={`${prefix}-lazy-points`}
          value={points}
          onChange={(event) => onPoints(event.target.value)}
          rows={3}
          className="w-full rounded-md border bg-transparent p-2"
        />
      </FormField>
    </fieldset>
  );
}

'use client';

import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
      Loading editor…
    </div>
  ),
});

interface MonacoFieldProps {
  label: string;
  language: 'markdown' | 'json';
  value: string;
  onChange: (value: string) => void;
  height?: string;
  hint?: string;
}

export function MonacoField({
  label,
  language,
  value,
  onChange,
  height = '420px',
  hint,
}: MonacoFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </span>
      <div
        className="overflow-hidden rounded-md border border-[var(--color-border-soft)] bg-white"
        style={{ height }}
      >
        <MonacoEditor
          language={language}
          value={value}
          onChange={(next) => onChange(next ?? '')}
          theme="vs"
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
      {hint && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}

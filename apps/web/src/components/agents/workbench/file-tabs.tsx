'use client';

import { X } from 'lucide-react';
import { useWorkbench } from './workbench-context';

export function FileTabs() {
  const { state, activate, closeTab } = useWorkbench();

  if (state.openPaths.length === 0) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="Open files"
      className="flex overflow-x-auto border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]"
    >
      {state.openPaths.map((path) => {
        const isActive = state.activePath === path;
        const fileName = path.split('/').pop();
        return (
          <div
            key={path}
            role="tab"
            aria-selected={isActive}
            title={path}
            className={`group flex shrink-0 items-center border-r border-[var(--color-border-soft)] font-mono text-[13px] transition-colors ${
              isActive
                ? 'bg-[var(--color-bg-warm-white)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <button
              type="button"
              onClick={() => activate(path)}
              className="py-2 pl-3 pr-1"
            >
              {fileName}
            </button>
            <button
              type="button"
              aria-label={`Close ${fileName}`}
              onClick={() => closeTab(path)}
              className="mr-1.5 rounded p-0.5 text-[var(--color-text-muted)] opacity-60 transition-opacity hover:bg-[var(--color-bg-surface)] hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

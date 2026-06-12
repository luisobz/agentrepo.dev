'use client';

import { useAvatar } from '@agentrepo/avatar';
import { skillTypeSchema } from '@agentrepo/trpc/schemas';
import { TypeChip } from '@agentrepo/ui';
import { FileText, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../utils/trpc';
import { useCommandPalette } from './command-palette-provider';
import {
  flattenGroups,
  groupHits,
  hitHref,
  moveSelection,
  type SearchHit,
} from './palette-utils';
import { useDebouncedValue } from './use-debounced-value';

const MIN_QUERY_LENGTH = 2;

function HitBadge({ hit }: { hit: SearchHit }) {
  if (hit.type === 'skill') {
    const skillType = skillTypeSchema.safeParse(hit.badge);
    if (skillType.success) {
      return <TypeChip type={skillType.data} className="shrink-0" />;
    }
  }
  return (
    <span className="shrink-0 rounded-full border border-[var(--color-border-medium)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
      {hit.type === 'agent' ? hit.badge ?? 'agent' : hit.type}
    </span>
  );
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { setEmotion } = useAvatar();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query.trim(), 200);
  const isQueryReady = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const search = trpc.search.global.useQuery(
    { query: debouncedQuery },
    {
      enabled: isOpen && isQueryReady,
      placeholderData: (previous) => previous,
      staleTime: 30_000,
    }
  );

  const groups = useMemo(
    () => groupHits(isQueryReady ? search.data ?? [] : []),
    [isQueryReady, search.data]
  );
  const flatHits = useMemo(() => flattenGroups(groups), [groups]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = '';
      };
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isQueryReady) {
      setEmotion('idle');
    } else if (search.isFetching) {
      setEmotion('thinking');
    } else if (flatHits.length > 0) {
      setEmotion('happy');
    } else {
      setEmotion('surprised');
    }
  }, [isOpen, isQueryReady, search.isFetching, flatHits.length, setEmotion]);

  if (!isOpen) {
    return null;
  }

  const openHit = (hit: SearchHit) => {
    close();
    router.push(hitHref(hit));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setSelectedIndex((current) =>
        moveSelection(current, delta, flatHits.length)
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const hit = flatHits[selectedIndex];
      if (hit) {
        openHit(hit);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 px-4 pt-[14vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]/95 shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border-soft)] px-4 py-3">
          {search.isFetching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-brand-garnet)]" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills, agents and blog posts…"
            aria-label="Search query"
            className="w-full bg-transparent text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
            esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {!isQueryReady && (
            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
              Type at least {MIN_QUERY_LENGTH} characters to search the whole
              site.
            </p>
          )}

          {isQueryReady && !search.isFetching && flatHits.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
              No results for “{debouncedQuery}”.
            </p>
          )}

          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {group.label}
              </h3>
              <ul>
                {group.hits.map((hit) => {
                  const index = flatHits.indexOf(hit);
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={`${hit.type}-${hit.id}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => openHit(hit)}
                        onMouseMove={() => setSelectedIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-[var(--color-brand-garnet-ghost)]'
                            : 'hover:bg-[var(--color-bg-surface)]'
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">
                            {hit.title}
                          </span>
                          {hit.description && (
                            <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                              {hit.description}
                            </span>
                          )}
                        </span>
                        <HitBadge hit={hit} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/60 px-4 py-2 font-mono text-[11px] text-[var(--color-text-muted)]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

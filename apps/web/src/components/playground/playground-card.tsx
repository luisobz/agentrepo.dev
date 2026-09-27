'use client';

import { AvatarSlot } from '@agentrepo/avatar';
import {
  AlertTriangle,
  Check,
  Eye,
  BookOpen,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { useT } from '../../lib/i18n/use-t';
import {
  AGENT_LABELS,
  DOCUMENTATION_LIBRARIES,
  type DocumentationLibrary,
  type PlaygroundCardData,
} from './playground-types';

const AGENT_STYLES: Record<string, string> = {
  coder: 'bg-[#2f5d8a]/20 text-[#8aaac8] border-[#2f5d8a]/40',
  tester: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  documenter: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
  deployer: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
};

export interface PlaygroundCardProps {
  card: PlaygroundCardData;
  isDraggable?: boolean;
  /** When true, the avatar docks at this card's top-right corner. */
  hostAvatar?: boolean;
  onDragStart?: (event: DragEvent<HTMLElement>, cardId: string) => void;
  onStart?: (cardId: string) => void;
  onPreview?: (cardId: string) => void;
  onDocument?: (cardId: string, library: DocumentationLibrary) => void;
  isSelected?: boolean;
  onSelect?: (cardId: string, selected: boolean) => void;
}

export function PlaygroundCard({
  card,
  isDraggable = false,
  hostAvatar = false,
  onDragStart,
  onStart,
  onPreview,
  onDocument,
  isSelected = false,
  onSelect,
}: PlaygroundCardProps) {
  const t = useT();
  const [library, setLibrary] = useState<DocumentationLibrary>('Outline');
  return (
    <article
      data-testid={`playground-card-${card.id}`}
      draggable={isDraggable}
      onDragStart={(event) => onDragStart?.(event, card.id)}
      className={`relative rounded-xl border p-4 backdrop-blur-md transition-colors ${
        card.hasError
          ? 'border-red-500/60 bg-red-950/30'
          : 'border-white/10 bg-white/[0.04] hover:border-[#c4909a]/40'
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {hostAvatar ? (
        <div className="pointer-events-none absolute right-0 top-0 z-10 -translate-y-1/2 translate-x-1/2">
          <AvatarSlot id="playground-card" preserveSpace={false} scale={0.7} />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#fdf8ef]">{card.title}</h3>
        {card.agent ? (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${AGENT_STYLES[card.agent]}`}
          >
            [{AGENT_LABELS[card.agent]}]
          </span>
        ) : null}
      </div>

      {card.subtasks.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {card.subtasks.map((subtask) => (
            <li
              key={subtask.label}
              className={`flex items-center gap-2 text-xs ${
                subtask.done ? 'text-emerald-300' : 'text-[#8d8273]'
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  subtask.done
                    ? 'border-emerald-400/60 bg-emerald-500/20'
                    : 'border-white/20'
                }`}
              >
                {subtask.done ? <Check className="h-2.5 w-2.5" /> : null}
              </span>
              {subtask.label}
            </li>
          ))}
        </ul>
      ) : null}

      {card.hasError ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-1.5 text-xs text-red-300"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {card.errorDetail ?? t('playground.assertionFailed')}
        </p>
      ) : null}

      {card.column === 'backlog' && onStart ? (
        <button
          type="button"
          onClick={() => onStart(card.id)}
          disabled={!isDraggable}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#c4909a]/40 bg-[#7a2230]/20 px-3 py-2 text-xs font-semibold text-[#e8c2ca] hover:bg-[#7a2230]/40 disabled:opacity-50"
        >
          {t('playground.startTask')} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {card.column === 'review' && onPreview ? (
        <button
          type="button"
          onClick={() => onPreview(card.id)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#c4909a]/40 bg-[#7a2230]/20 px-3 py-2 text-xs font-semibold text-[#e8c2ca] transition-colors hover:bg-[#7a2230]/40"
        >
          <Eye className="h-3.5 w-3.5" />
          {t('playground.viewPreview')}
        </button>
      ) : null}

      {card.column === 'review' && onDocument ? (
        <div className="mt-3 space-y-2">
          <label
            className="block text-xs text-[#cfc6b8]"
            htmlFor={`library-${card.id}`}
          >
            {t('playground.documentationLibrary')}
          </label>
          <select
            id={`library-${card.id}`}
            value={library}
            onChange={(event) =>
              setLibrary(event.target.value as DocumentationLibrary)
            }
            className="w-full rounded-lg border border-white/20 bg-[#211a1a] px-2 py-2 text-xs text-[#fdf8ef]"
          >
            {DOCUMENTATION_LIBRARIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onDocument(card.id, library)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-800 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
          >
            <BookOpen className="h-3.5 w-3.5" /> {t('playground.document')}
          </button>
        </div>
      ) : null}

      {card.column === 'documentation' ? (
        <div className="mt-3 space-y-2 text-xs text-[#cfc6b8]">
          <p className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {t('playground.connectedTo')}{' '}
            {card.documentationLibrary}
          </p>
          <p className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> {card.screenshotCount ?? 0}{' '}
            {t('playground.screenshots')}
          </p>
          {card.isMerged ? (
            <p className="font-semibold text-emerald-300">
              ✓ {t('playground.merged')}
            </p>
          ) : null}
          {card.isMerged && !card.isDeployed && onSelect ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 p-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(event) => onSelect(card.id, event.target.checked)}
              />
              {t('playground.selectForRelease')}
            </label>
          ) : null}
        </div>
      ) : null}

      {card.isDeployed ? (
        <p className="mt-3 text-xs text-emerald-300">
          ✓ {t('playground.deploySuccess')}
          {card.releaseTag ? (
            <span className="ml-1 font-mono">{card.releaseTag}</span>
          ) : null}
          {card.deployedUrl ? (
            <span className="mt-1 block truncate font-mono text-[10px] text-emerald-200/80">
              {card.deployedUrl}
            </span>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}

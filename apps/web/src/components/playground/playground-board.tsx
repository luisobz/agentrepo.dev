'use client';

import { useAvatar } from '@agentrepo/avatar';
import { KeyRound, Plus, Sparkles } from 'lucide-react';
import { type DragEvent, useCallback, useState } from 'react';
import { AvatarGuidance } from './avatar-guidance';
import { ConfettiBurst } from './confetti-burst';
import { PlaygroundCard } from './playground-card';
import {
  COLUMN_LABELS,
  PLAYGROUND_COLUMNS,
  type PlaygroundCardData,
  type PlaygroundColumnId,
} from './playground-types';
import { PreviewModal } from './preview-modal';
import {
  MOCK_INTRO_MESSAGE,
  type PlaygroundGuidance,
  usePlaygroundMock,
} from './use-playground-mock';
import { usePlaygroundReal } from './use-playground-real';

type PlaygroundMode = 'mock' | 'real';

export function PlaygroundBoard() {
  const { setEmotion } = useAvatar();
  const [mode, setMode] = useState<PlaygroundMode>('mock');
  const [guidance, setGuidance] = useState<PlaygroundGuidance>({
    message: MOCK_INTRO_MESSAGE,
    emotion: 'idle',
  });
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState('');

  const handleGuidance = useCallback(
    (next: PlaygroundGuidance) => {
      setGuidance(next);
      setEmotion(next.emotion);
    },
    [setEmotion]
  );

  const mock = usePlaygroundMock({ onGuidance: handleGuidance });
  const real = usePlaygroundReal({ onGuidance: handleGuidance });

  const cards = mode === 'mock' ? mock.cards : real.cards;
  const celebratingCardId =
    mode === 'mock' ? mock.celebratingCardId : real.celebratingCardId;
  const previewCard =
    cards.find((card) => card.id === previewCardId) ?? null;

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    cardId: string
  ) => {
    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (
    event: DragEvent<HTMLElement>,
    column: PlaygroundColumnId
  ) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/plain');
    if (mode === 'mock' && column === 'develop') {
      mock.moveCardToDevelop(cardId);
    }
  };

  const handleCreateFeature = () => {
    const prompt = promptDraft.trim();
    if (prompt.length < 10) {
      return;
    }
    real.createFeature(prompt);
    setPromptDraft('');
  };

  const cardsInColumn = (column: PlaygroundColumnId): PlaygroundCardData[] =>
    cards.filter((card) => card.column === column);

  return (
    <div className="flex flex-col gap-6">
      <AvatarGuidance message={guidance.message} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Modo del playground"
          className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1"
        >
          {(['mock', 'real'] as const).map((value) => (
            <button
              key={value}
              role="tab"
              aria-selected={mode === value}
              onClick={() => {
                setMode(value);
                handleGuidance(
                  value === 'mock'
                    ? { message: MOCK_INTRO_MESSAGE, emotion: 'idle' }
                    : {
                        message:
                          'Modo real: introduce tu token de acceso y describe la feature que quieres que construyan los agentes.',
                        emotion: 'idle',
                      }
                );
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === value
                  ? 'bg-[#7a2230]/40 text-[#fdf8ef]'
                  : 'text-[#8d8273] hover:text-[#cfc6b8]'
              }`}
            >
              {value === 'mock' ? 'Simulación guiada' : 'Modo real (IA)'}
            </button>
          ))}
        </div>

        {mode === 'real' ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
              <KeyRound className="h-4 w-4 text-[#8d8273]" />
              <input
                aria-label="Token de acceso"
                type="password"
                placeholder="Token de acceso"
                value={real.token}
                onChange={(event) => real.setToken(event.target.value)}
                className="w-44 bg-transparent text-sm text-[#fdf8ef] placeholder:text-[#8d8273] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={real.validateToken}
              disabled={real.tokenStatus === 'checking'}
              className="rounded-xl border border-[#c4909a]/40 bg-[#7a2230]/20 px-4 py-2 text-sm font-medium text-[#e8c2ca] transition-colors hover:bg-[#7a2230]/40 disabled:opacity-60"
            >
              {real.tokenStatus === 'checking' ? 'Validando…' : 'Validar token'}
            </button>
            {real.tokenStatus === 'valid' ? (
              <span className="text-xs text-emerald-300">
                ✓ Token válido · {real.remainingUses} usos restantes
              </span>
            ) : real.tokenStatus === 'invalid' ? (
              <span role="alert" className="text-xs text-red-300">
                Token inválido, caducado o agotado
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {mode === 'real' ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row">
          <input
            aria-label="Describe tu feature"
            placeholder="Describe tu feature… (ej: un formulario de perfil con subida de avatar)"
            value={promptDraft}
            onChange={(event) => setPromptDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateFeature();
              }
            }}
            disabled={real.tokenStatus !== 'valid' || real.isRunning}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#fdf8ef] placeholder:text-[#8d8273] focus:border-[#c4909a] focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleCreateFeature}
            disabled={
              real.tokenStatus !== 'valid' ||
              real.isRunning ||
              promptDraft.trim().length < 10
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7a2230] to-[#5b1822] px-5 py-3 text-sm font-semibold text-[#fdf8ef] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {real.isRunning ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Agentes trabajando…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear Feature
              </>
            )}
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {PLAYGROUND_COLUMNS.map((column) => (
          <section
            key={column}
            aria-label={COLUMN_LABELS[column]}
            onDragOver={(event) => {
              if (mode === 'mock' && column === 'develop') {
                event.preventDefault();
              }
            }}
            onDrop={(event) => handleDrop(event, column)}
            className={`flex min-h-56 flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md ${
              column === 'develop' && mode === 'mock'
                ? 'border-[#c4909a]/30 bg-[#7a2230]/5'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8d8273]">
                {COLUMN_LABELS[column]}
              </h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#8d8273]">
                {cardsInColumn(column).length}
              </span>
            </header>
            {cardsInColumn(column).map((card) => (
              <PlaygroundCard
                key={card.id}
                card={card}
                isDraggable={
                  mode === 'mock' && card.column === 'backlog' && !mock.isBusy
                }
                onDragStart={handleDragStart}
                onPreview={setPreviewCardId}
                onDeploy={mode === 'mock' ? mock.deployCard : real.deployCard}
              />
            ))}
          </section>
        ))}
      </div>

      {previewCard ? (
        <PreviewModal card={previewCard} onClose={() => setPreviewCardId(null)} />
      ) : null}
      {celebratingCardId ? <ConfettiBurst /> : null}
    </div>
  );
}

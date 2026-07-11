'use client';

import { useAvatar } from '@agentrepo/avatar';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useT } from '../../lib/i18n/use-t';
import { AgentChat, type ChatMessage } from './agent-chat';
import { ConfettiBurst } from './confetti-burst';
import { PlaygroundCard } from './playground-card';
import {
  COLUMN_LABEL_KEYS,
  PLAYGROUND_COLUMNS,
  type PlaygroundCardData,
  type PlaygroundColumnId,
} from './playground-types';
import { PreviewModal } from './preview-modal';
import { type PlaygroundGuidance, usePlaygroundMock } from './use-playground-mock';

export function PlaygroundBoard() {
  const t = useT();
  const { setEmotion, setAvatarPosition, say, clearMessages } = useAvatar();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'intro', text: t('playground.mock.intro') },
  ]);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const messageIdRef = useRef(0);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const handleGuidance = useCallback(
    (next: PlaygroundGuidance) => {
      setEmotion(next.emotion);
      const entry: ChatMessage = {
        id: `msg-${(messageIdRef.current += 1)}`,
        text: next.message,
      };
      // On restart the log collapses back to the single intro message.
      setMessages((current) => (next.reset ? [entry] : [...current, entry]));
      // While the chat is collapsed, the avatar speaks the step via a bubble.
      if (next.reset) {
        clearMessages();
      }
      if (!chatOpenRef.current) {
        // Bubble above the card so it never covers the card content.
        say(next.message, { durationMs: 2600, placement: 'top' });
      }
    },
    [setEmotion, say, clearMessages]
  );

  const handleClearChat = useCallback(() => setMessages([]), []);

  const mock = usePlaygroundMock({ onGuidance: handleGuidance });

  const cards = mock.cards;
  const celebratingCardId = mock.celebratingCardId;
  const previewCard =
    cards.find((card) => card.id === previewCardId) ?? null;

  // The card an agent is actively working on (has an agent or is deploying).
  const activeCardId =
    cards.find((card) => card.agent !== undefined || card.isDeploying)?.id ??
    null;

  // Route the avatar: into the chat when open, onto the working card while it
  // processes, otherwise back to the collapsed chat launcher.
  useEffect(() => {
    setAvatarPosition(
      !chatOpen && activeCardId ? 'playground-card' : 'playground-guide'
    );
  }, [chatOpen, activeCardId, setAvatarPosition]);

  // Opening the chat hands narration over to the log, so drop the bubble.
  useEffect(() => {
    if (chatOpen) {
      clearMessages();
    }
  }, [chatOpen, clearMessages]);

  // Leaving the playground sends the avatar back to the header.
  useEffect(() => () => setAvatarPosition('header'), [setAvatarPosition]);

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
    if (column === 'develop') {
      mock.moveCardToDevelop(cardId);
    }
  };

  const cardsInColumn = (column: PlaygroundColumnId): PlaygroundCardData[] =>
    cards.filter((card) => card.column === column);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-xl border border-[#c4909a]/30 bg-[#7a2230]/20 px-4 py-2 text-sm font-medium text-[#e8c2ca]">
          <Sparkles className="h-4 w-4" />
          {t('playground.guidedSimulation')}
        </span>

        <button
          type="button"
          onClick={mock.restart}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#cfc6b8] transition-colors hover:border-[#c4909a]/50 hover:text-[#fdf8ef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4909a]/60"
        >
          <RotateCcw className="h-4 w-4" />
          {t('playground.restart')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {PLAYGROUND_COLUMNS.map((column) => (
          <section
            key={column}
            aria-label={t(COLUMN_LABEL_KEYS[column])}
            onDragOver={(event) => {
              if (column === 'develop') {
                event.preventDefault();
              }
            }}
            onDrop={(event) => handleDrop(event, column)}
            className={`flex min-h-56 flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md ${
              column === 'develop'
                ? 'border-[#c4909a]/30 bg-[#7a2230]/5'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8d8273]">
                {t(COLUMN_LABEL_KEYS[column])}
              </h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#8d8273]">
                {cardsInColumn(column).length}
              </span>
            </header>
            {cardsInColumn(column).map((card) => (
              <PlaygroundCard
                key={card.id}
                card={card}
                isDraggable={card.column === 'backlog' && !mock.isBusy}
                hostAvatar={!chatOpen && card.id === activeCardId}
                onDragStart={handleDragStart}
                onPreview={setPreviewCardId}
                onDeploy={mock.deployCard}
              />
            ))}
          </section>
        ))}
      </div>

      {previewCard ? (
        <PreviewModal card={previewCard} onClose={() => setPreviewCardId(null)} />
      ) : null}
      {celebratingCardId ? <ConfettiBurst /> : null}

      <AgentChat
        messages={messages}
        open={chatOpen}
        onOpenChange={setChatOpen}
        onClear={handleClearChat}
      />
    </div>
  );
}

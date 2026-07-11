'use client';

import { AvatarSlot, useAvatar } from '@agentrepo/avatar';
import { Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../lib/i18n/use-t';

export interface ChatMessage {
  id: string;
  text: string;
}

export interface AgentChatProps {
  messages: ChatMessage[];
  /** Controlled open state (the board owns it to orchestrate the avatar). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Clears the conversation log. */
  onClear?: () => void;
}

/**
 * Collapsible agent chat that narrates what the sub-agents are doing. Collapsed
 * into a floating bubble with an unread badge; expands into a modal-style panel
 * where the messages stack up like a real assistant conversation. Its open
 * state is controlled by the board so the avatar can be routed accordingly.
 */
export function AgentChat({
  messages,
  open,
  onOpenChange,
  onClear,
}: AgentChatProps) {
  const t = useT();
  const [unread, setUnread] = useState(0);
  const { setBadge } = useAvatar();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);

  const latest = messages[messages.length - 1];

  // Count messages that arrive while the panel is collapsed.
  useEffect(() => {
    const grew = messages.length - prevCountRef.current;
    if (grew > 0 && !open) {
      setUnread((current) => current + grew);
    }
    prevCountRef.current = messages.length;
  }, [messages.length, open]);

  // Surface the unread count as a badge over the avatar (wherever it is).
  useEffect(() => {
    setBadge(open ? null : unread);
  }, [open, unread, setBadge]);
  useEffect(() => () => setBadge(null), [setBadge]);

  // Keep the newest message in view and clear the badge while open.
  useEffect(() => {
    if (!open) {
      return;
    }
    setUnread(0);
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [open, messages.length]);

  return (
    <>
      {/* Always-mounted live region so new narration is announced to AT. */}
      <p role="status" aria-live="polite" className="sr-only">
        {latest?.text}
      </p>

      {/* Collapsed launcher */}
      {!open ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label={t('playground.openChat')}
          className="fixed bottom-5 right-5 z-40 flex max-w-[min(20rem,calc(100vw-2.5rem))] items-center gap-3 rounded-2xl border border-[#c4909a]/30 bg-[#1b1714]/95 p-3 pr-4 text-left shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4909a]/60"
        >
          <span className="relative shrink-0">
            <AvatarSlot
              id="playground-guide"
              preserveSpace={false}
              scale={0.9}
            />
          </span>
          <span className="line-clamp-2 text-xs leading-relaxed text-[#cfc6b8]">
            {latest?.text ?? t('playground.assistantReady')}
          </span>
        </button>
      ) : null}

      {/* Expanded modal-style panel */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="dialog"
            aria-label={t('playground.chatTitle')}
            className="relative flex h-[min(70vh,32rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161311] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <AvatarSlot
                  id="playground-guide"
                  preserveSpace={false}
                  scale={0.6}
                />
                <span className="flex items-center gap-2 text-sm font-semibold text-[#fdf8ef]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  {t('playground.assistant')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {onClear ? (
                  <button
                    type="button"
                    aria-label={t('playground.clearChat')}
                    onClick={onClear}
                    className="rounded-lg p-1.5 text-[#8d8273] transition-colors hover:bg-white/[0.08] hover:text-[#fdf8ef]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label={t('playground.closeChat')}
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg p-1.5 text-[#8d8273] transition-colors hover:bg-white/[0.08] hover:text-[#fdf8ef]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[#8d8273]">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-xs">{t('playground.emptyChatHint')}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="max-w-[88%] rounded-2xl rounded-bl-sm border border-[#c4909a]/25 bg-[#7a2230]/15 px-3.5 py-2.5 text-sm leading-relaxed text-[#f4ece0] animate-in fade-in slide-in-from-bottom-1"
                  >
                    {message.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

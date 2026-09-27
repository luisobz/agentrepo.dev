'use client';

import { useCallback, useState } from 'react';
import { trpc } from '../utils/trpc';
import type { PlaygroundCardData } from './playground-types';
import type { PlaygroundGuidance } from './use-playground-mock';

export type TokenStatus = 'unchecked' | 'checking' | 'valid' | 'invalid';

interface ActiveRun {
  cardId: string;
  prompt: string;
}

export interface UsePlaygroundRealOptions {
  onGuidance?: (guidance: PlaygroundGuidance) => void;
}

export interface UsePlaygroundRealResult {
  cards: PlaygroundCardData[];
  token: string;
  setToken: (token: string) => void;
  tokenStatus: TokenStatus;
  remainingUses: number;
  validateToken: () => void;
  isRunning: boolean;
  createFeature: (prompt: string) => void;
  deployCard: (cardId: string) => void;
  celebratingCardId: string | null;
}

let realCardCounter = 0;

function titleFromPrompt(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, ' ');
  return clean.length > 64 ? `${clean.slice(0, 61)}…` : clean;
}

/**
 * Real agent flow: consumes the tRPC SSE subscription and projects each
 * coder/tester/self-healing/review event onto the Kanban card so the board
 * moves live while DeepSeek writes the component.
 */
export function usePlaygroundReal(
  options?: UsePlaygroundRealOptions,
): UsePlaygroundRealResult {
  const [cards, setCards] = useState<PlaygroundCardData[]>([]);
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('unchecked');
  const [remainingUses, setRemainingUses] = useState(0);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [celebratingCardId, setCelebratingCardId] = useState<string | null>(
    null,
  );

  const emitGuidance = options?.onGuidance;

  const patchCard = useCallback(
    (cardId: string, patch: Partial<PlaygroundCardData>) => {
      setCards((current) =>
        current.map((card) =>
          card.id === cardId ? { ...card, ...patch } : card,
        ),
      );
    },
    [],
  );

  const validateTokenMutation = trpc.playground.validateToken.useMutation({
    onSuccess: (result) => {
      setTokenStatus(result.valid ? 'valid' : 'invalid');
      setRemainingUses(result.remainingUses);
    },
    onError: () => setTokenStatus('invalid'),
  });

  const validateToken = useCallback(() => {
    if (token.trim().length < 8) {
      setTokenStatus('invalid');
      return;
    }
    setTokenStatus('checking');
    validateTokenMutation.mutate({ token: token.trim() });
  }, [token, validateTokenMutation]);

  trpc.playground.executeFlow.useSubscription(
    activeRun
      ? { token: token.trim(), prompt: activeRun.prompt }
      : { token: 'disabled-run', prompt: 'disabled prompt padding' },
    {
      enabled: activeRun !== null,
      onData: (event) => {
        if (!activeRun) {
          return;
        }
        const { cardId } = activeRun;
        switch (event.type) {
          case 'coder':
            patchCard(cardId, {
              column: 'develop',
              agent: 'coder',
              hasError: false,
              subtasks: [
                { label: 'Analizar requerimiento', done: true },
                { label: 'Generar componente', done: event.phase === 'done' },
              ],
              ...(event.phase === 'done' ? { summary: event.detail } : {}),
            });
            emitGuidance?.({
              message:
                event.phase === 'done'
                  ? `CoderAgent: ${event.detail}`
                  : 'CoderAgent escribiendo el componente en DeepSeek...',
              emotion: 'thinking',
            });
            break;
          case 'tester':
            patchCard(cardId, {
              column: 'testing',
              agent: 'tester',
              hasError: event.phase === 'failed',
              errorDetail: event.phase === 'failed' ? event.detail : undefined,
            });
            emitGuidance?.({
              message:
                event.phase === 'failed'
                  ? `TesterAgent encontró fallos: ${event.detail}`
                  : event.phase === 'passed'
                    ? '✓ Tests passed. Preparando la review...'
                    : 'TesterAgent validando el código generado...',
              emotion: event.phase === 'failed' ? 'surprised' : 'thinking',
            });
            break;
          case 'self-healing':
            patchCard(cardId, { column: 'develop', agent: 'coder' });
            emitGuidance?.({
              message: `Self-healing (intento ${event.attempt}): el Coder está reparando el fallo...`,
              emotion: 'thinking',
            });
            break;
          case 'review':
            patchCard(cardId, {
              column: 'review',
              agent: undefined,
              hasError: false,
              code: event.code,
              summary: event.summary,
              subtasks: [
                { label: 'Componente generado', done: true },
                { label: '✓ Tests passed', done: true },
              ],
            });
            emitGuidance?.({
              message:
                'La feature está lista en Review. Previsualiza el código y despliégala.',
              emotion: 'happy',
            });
            setActiveRun(null);
            setRemainingUses((uses) => Math.max(0, uses - 1));
            break;
          case 'error':
            patchCard(cardId, {
              hasError: true,
              errorDetail: event.detail,
              agent: undefined,
            });
            emitGuidance?.({
              message: `El flujo se detuvo: ${event.detail}`,
              emotion: 'surprised',
            });
            setActiveRun(null);
            break;
        }
      },
      onError: (error) => {
        if (activeRun) {
          patchCard(activeRun.cardId, {
            hasError: true,
            errorDetail: error.message,
            agent: undefined,
          });
          setActiveRun(null);
        }
        emitGuidance?.({
          message: `El flujo se detuvo: ${error.message}`,
          emotion: 'surprised',
        });
      },
    },
  );

  const createFeature = useCallback(
    (prompt: string) => {
      if (tokenStatus !== 'valid' || activeRun) {
        return;
      }
      realCardCounter += 1;
      const cardId = `real-${realCardCounter}`;
      setCards((current) => [
        ...current,
        {
          id: cardId,
          title: titleFromPrompt(prompt),
          column: 'develop',
          kind: 'real',
          prompt,
          agent: 'coder',
          subtasks: [{ label: 'Analizar requerimiento', done: false }],
        },
      ]);
      setActiveRun({ cardId, prompt });
      emitGuidance?.({
        message: 'Validando token y despertando a los subagentes...',
        emotion: 'thinking',
      });
    },
    [activeRun, emitGuidance, tokenStatus],
  );

  const deployMutation = trpc.playground.deploy.useMutation();

  const deployCard = useCallback(
    (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card || card.column !== 'review' || !card.code || !card.prompt) {
        return;
      }
      patchCard(cardId, { isDeploying: true, agent: 'deployer' });
      emitGuidance?.({
        message: 'Desplegando en Spaceship...',
        emotion: 'thinking',
      });
      deployMutation.mutate(
        {
          token: token.trim(),
          title: card.title,
          prompt: card.prompt,
          code: card.code,
        },
        {
          onSuccess: (deployment) => {
            patchCard(cardId, {
              column: 'review',
              isDeploying: false,
              isDeployed: true,
              deployedUrl: deployment.url,
              agent: undefined,
            });
            emitGuidance?.({
              message: `¡Deploy exitoso! Tu feature vive en ${deployment.url} 🎉`,
              emotion: 'happy',
            });
            setCelebratingCardId(cardId);
            setTimeout(() => setCelebratingCardId(null), 3_000);
          },
          onError: (error) => {
            patchCard(cardId, {
              isDeploying: false,
              hasError: true,
              errorDetail: error.message,
            });
          },
        },
      );
    },
    [cards, deployMutation, emitGuidance, patchCard, token],
  );

  return {
    cards,
    token,
    setToken: (value: string) => {
      setToken(value);
      setTokenStatus('unchecked');
    },
    tokenStatus,
    remainingUses,
    validateToken,
    isRunning: activeRun !== null,
    createFeature,
    deployCard,
    celebratingCardId,
  };
}

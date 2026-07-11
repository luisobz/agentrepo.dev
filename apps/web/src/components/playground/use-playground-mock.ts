'use client';

import type { AvatarEmotion } from '@agentrepo/avatar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../../lib/i18n/use-t';
import type {
  MockPreviewId,
  PlaygroundCardData,
} from './playground-types';

// Timeline of the scripted demo, in milliseconds.
export const MOCK_TIMINGS = {
  subtaskInterval: 1_000,
  developToTesting: 3_000,
  testingFailure: 2_000,
  refactorPause: 2_000,
  retestPass: 1_500,
  deployDuration: 1_500,
} as const;

const SUBTASKS = ['Write code', 'Setup tests', 'Polish styles'];

function buildMockCard(
  id: string,
  title: string,
  previewId: MockPreviewId
): PlaygroundCardData {
  return {
    id,
    title,
    column: 'backlog',
    kind: 'mock',
    previewId,
    subtasks: SUBTASKS.map((label) => ({ label, done: false })),
  };
}

export const INITIAL_MOCK_CARDS: PlaygroundCardData[] = [
  buildMockCard('mock-1', 'Feature 1: Premium Dark Hero Page', 'dark-hero'),
  buildMockCard('mock-2', 'Feature 2: Secure GitHub OAuth Flow', 'oauth-flow'),
  buildMockCard(
    'mock-3',
    'Feature 3: High-Performance Redis Caching',
    'redis-cache'
  ),
];

export interface PlaygroundGuidance {
  message: string;
  emotion: AvatarEmotion;
  /** When true, consumers should reset their message log to this message. */
  reset?: boolean;
}

export interface UsePlaygroundMockOptions {
  onGuidance?: (guidance: PlaygroundGuidance) => void;
}

export interface UsePlaygroundMockResult {
  cards: PlaygroundCardData[];
  guidance: PlaygroundGuidance;
  /** True while a card is running the scripted pipeline. */
  isBusy: boolean;
  celebratingCardId: string | null;
  moveCardToDevelop: (cardId: string) => void;
  deployCard: (cardId: string) => void;
  /** Cancels pending timers and resets the board to its initial state. */
  restart: () => void;
}

/**
 * Scripted state machine of the demo flow: develop → testing → (failure)
 * → develop → testing → review, driven by timers so the board animates on
 * its own once the visitor drags a backlog card into "Desarrollar".
 */
export function usePlaygroundMock(
  options?: UsePlaygroundMockOptions
): UsePlaygroundMockResult {
  const t = useT();
  const [cards, setCards] = useState<PlaygroundCardData[]>(INITIAL_MOCK_CARDS);
  const [guidance, setGuidanceState] = useState<PlaygroundGuidance>({
    message: t('playground.mock.intro'),
    emotion: 'idle',
  });
  const [isBusy, setIsBusy] = useState(false);
  const [celebratingCardId, setCelebratingCardId] = useState<string | null>(
    null
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onGuidanceRef = useRef(options?.onGuidance);
  onGuidanceRef.current = options?.onGuidance;

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const schedule = useCallback((delay: number, action: () => void) => {
    timersRef.current.push(setTimeout(action, delay));
  }, []);

  const setGuidance = useCallback((guidance: PlaygroundGuidance) => {
    setGuidanceState(guidance);
    onGuidanceRef.current?.(guidance);
  }, []);

  const patchCard = useCallback(
    (cardId: string, patch: Partial<PlaygroundCardData>) => {
      setCards((current) =>
        current.map((card) =>
          card.id === cardId ? { ...card, ...patch } : card
        )
      );
    },
    []
  );

  const completeSubtasksProgressively = useCallback(
    (cardId: string) => {
      SUBTASKS.forEach((_, index) => {
        schedule(MOCK_TIMINGS.subtaskInterval * (index + 1), () => {
          setCards((current) =>
            current.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    subtasks: card.subtasks.map((subtask, subtaskIndex) =>
                      subtaskIndex <= index
                        ? { ...subtask, done: true }
                        : subtask
                    ),
                  }
                : card
            )
          );
        });
      });
    },
    [schedule]
  );

  const moveCardToDevelop = useCallback(
    (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card || card.column !== 'backlog' || isBusy) {
        return;
      }
      setIsBusy(true);

      // Step 1 — CoderAgent takes the task.
      patchCard(cardId, { column: 'develop', agent: 'coder', hasError: false });
      setGuidance({
        message: t('playground.mock.coderStart'),
        emotion: 'thinking',
      });
      completeSubtasksProgressively(cardId);

      // Step 2 — the card travels to Testing on its own.
      schedule(MOCK_TIMINGS.developToTesting, () => {
        patchCard(cardId, { column: 'testing', agent: 'tester' });
        setGuidance({
          message: t('playground.mock.testerRunning'),
          emotion: 'thinking',
        });
      });

      // Step 2b — the assertion fails and the card goes back to develop.
      const failureAt =
        MOCK_TIMINGS.developToTesting + MOCK_TIMINGS.testingFailure;
      schedule(failureAt, () => {
        patchCard(cardId, {
          column: 'develop',
          agent: 'coder',
          hasError: true,
          errorDetail: t('playground.mock.testFailedDetail'),
        });
        setGuidance({
          message: t('playground.mock.testFailed'),
          emotion: 'surprised',
        });
      });

      // Step 3 — refactor done, back to testing, this time it passes.
      const retestAt = failureAt + MOCK_TIMINGS.refactorPause;
      schedule(retestAt, () => {
        patchCard(cardId, { column: 'testing', agent: 'tester', hasError: false });
        setGuidance({
          message: t('playground.mock.retesting'),
          emotion: 'thinking',
        });
      });

      const reviewAt = retestAt + MOCK_TIMINGS.retestPass;
      schedule(reviewAt, () => {
        patchCard(cardId, {
          column: 'review',
          agent: undefined,
          subtasks: [...SUBTASKS, '✓ Tests passed'].map((label) => ({
            label,
            done: true,
          })),
        });
        setGuidance({
          message: t('playground.mock.readyForReview'),
          emotion: 'happy',
        });
        setIsBusy(false);
      });
    },
    [cards, completeSubtasksProgressively, isBusy, patchCard, schedule, setGuidance, t]
  );

  const deployCard = useCallback(
    (cardId: string) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card || card.column !== 'review' || card.isDeploying) {
        return;
      }
      patchCard(cardId, { isDeploying: true, agent: 'deployer' });
      setGuidance({
        message: t('playground.deploying'),
        emotion: 'thinking',
      });

      schedule(MOCK_TIMINGS.deployDuration, () => {
        patchCard(cardId, {
          column: 'deploy',
          isDeploying: false,
          isDeployed: true,
          agent: undefined,
        });
        setGuidance({
          message: t('playground.mock.deploySuccess'),
          emotion: 'happy',
        });
        setCelebratingCardId(cardId);
        schedule(3_000, () => setCelebratingCardId(null));
      });
    },
    [cards, patchCard, schedule, setGuidance, t]
  );

  const restart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCards(INITIAL_MOCK_CARDS);
    setIsBusy(false);
    setCelebratingCardId(null);
    setGuidance({
      message: t('playground.mock.intro'),
      emotion: 'idle',
      reset: true,
    });
  }, [setGuidance, t]);

  return {
    cards,
    guidance,
    isBusy,
    celebratingCardId,
    moveCardToDevelop,
    deployCard,
    restart,
  };
}

'use client';

import type { AvatarEmotion } from '@agentrepo/avatar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../../lib/i18n/use-t';
import type {
  DocumentationLibrary,
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
  documentationStep: 650,
  deployDuration: 1_500,
} as const;

const SUBTASKS = ['Write code', 'Setup tests', 'Polish styles'];

function buildMockCard(
  id: string,
  title: string,
  previewId: MockPreviewId,
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
    'redis-cache',
  ),
  buildMockCard(
    'mock-4',
    'Feature 4: Accessible Search Palette',
    'search-palette',
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
  isReleasing: boolean;
  celebratingCardId: string | null;
  moveCardToDevelop: (cardId: string) => void;
  documentCard: (cardId: string, library: DocumentationLibrary) => void;
  deployCards: (cardIds: string[]) => void;
  /** Cancels pending timers and resets the board to its initial state. */
  restart: () => void;
}

/**
 * Scripted state machine of the demo flow: develop → testing → (failure)
 * → develop → testing → review, driven by timers so the board animates on
 * its own once the visitor drags a backlog card into "Desarrollar".
 */
export function usePlaygroundMock(
  options?: UsePlaygroundMockOptions,
): UsePlaygroundMockResult {
  const t = useT();
  const [cards, setCards] = useState<PlaygroundCardData[]>(INITIAL_MOCK_CARDS);
  const [guidance, setGuidanceState] = useState<PlaygroundGuidance>({
    message: t('playground.mock.intro'),
    emotion: 'idle',
  });
  const [isBusy, setIsBusy] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [celebratingCardId, setCelebratingCardId] = useState<string | null>(
    null,
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const releaseCounterRef = useRef(1);
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
          card.id === cardId ? { ...card, ...patch } : card,
        ),
      );
    },
    [],
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
                        : subtask,
                    ),
                  }
                : card,
            ),
          );
        });
      });
    },
    [schedule],
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
        patchCard(cardId, {
          column: 'testing',
          agent: 'tester',
          hasError: false,
        });
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
    [
      cards,
      completeSubtasksProgressively,
      isBusy,
      patchCard,
      schedule,
      setGuidance,
      t,
    ],
  );

  const documentCard = useCallback(
    (cardId: string, library: DocumentationLibrary) => {
      const card = cards.find((item) => item.id === cardId);
      if (!card || card.column !== 'review' || isBusy) return;
      const steps = [
        `Connect to ${library}`,
        'Capture screenshots',
        'Write documentation',
        'Merge PR',
      ];
      setIsBusy(true);
      patchCard(cardId, {
        column: 'documentation',
        documentationLibrary: library,
        screenshotCount: 0,
        isMerged: false,
        agent: 'documenter',
        subtasks: steps.map((label) => ({ label, done: false })),
      });
      setGuidance({
        message: t('playground.mock.documenting'),
        emotion: 'thinking',
      });
      steps.forEach((_, index) => {
        schedule(MOCK_TIMINGS.documentationStep * (index + 1), () => {
          setCards((current) =>
            current.map((item) =>
              item.id === cardId
                ? {
                    ...item,
                    subtasks: item.subtasks.map((task, taskIndex) => ({
                      ...task,
                      done: taskIndex <= index,
                    })),
                    screenshotCount: index >= 1 ? 2 : 0,
                    isMerged: index === steps.length - 1,
                    agent:
                      index === steps.length - 1 ? undefined : 'documenter',
                  }
                : item,
            ),
          );
          if (index === steps.length - 1) {
            setIsBusy(false);
            setGuidance({
              message: t('playground.mock.documented'),
              emotion: 'happy',
            });
          }
        });
      });
    },
    [cards, isBusy, patchCard, schedule, setGuidance, t],
  );

  const deployCards = useCallback(
    (cardIds: string[]) => {
      if (
        isReleasing ||
        cardIds.length === 0 ||
        new Set(cardIds).size !== cardIds.length
      )
        return;
      const selected = cardIds.map((id) =>
        cards.find((card) => card.id === id),
      );
      if (
        selected.some(
          (card) =>
            !card ||
            card.column !== 'documentation' ||
            !card.isMerged ||
            card.isDeployed,
        )
      )
        return;
      setIsReleasing(true);
      setCards((current) =>
        current.map((card) =>
          cardIds.includes(card.id)
            ? { ...card, isDeploying: true, agent: 'deployer' }
            : card,
        ),
      );
      setGuidance({ message: t('playground.deploying'), emotion: 'thinking' });
      const releaseTag = `demo-v${releaseCounterRef.current++}`;
      schedule(MOCK_TIMINGS.deployDuration, () => {
        setCards((current) =>
          current.map((card) =>
            cardIds.includes(card.id)
              ? {
                  ...card,
                  isDeploying: false,
                  isDeployed: true,
                  releaseTag,
                  agent: undefined,
                }
              : card,
          ),
        );
        setIsReleasing(false);
        setGuidance({
          message: t('playground.mock.deploySuccess'),
          emotion: 'happy',
        });
        setCelebratingCardId(cardIds[0]);
        schedule(3_000, () => setCelebratingCardId(null));
      });
    },
    [cards, isReleasing, schedule, setGuidance, t],
  );

  const restart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCards(INITIAL_MOCK_CARDS);
    setIsBusy(false);
    setIsReleasing(false);
    releaseCounterRef.current = 1;
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
    isReleasing,
    celebratingCardId,
    moveCardToDevelop,
    documentCard,
    deployCards,
    restart,
  };
}

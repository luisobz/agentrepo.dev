import { LocaleProvider } from '@agentrepo/ui';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  INITIAL_MOCK_CARDS,
  MOCK_TIMINGS,
  usePlaygroundMock,
} from './use-playground-mock';

function cardById(
  result: { current: ReturnType<typeof usePlaygroundMock> },
  id: string
) {
  const card = result.current.cards.find((item) => item.id === id);
  if (!card) {
    throw new Error(`card ${id} not found`);
  }
  return card;
}

// The hook reads translations from the locale context; default locale is 'en'.
const wrapper = ({ children }: { children: ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

describe('usePlaygroundMock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the three immutable demo features in the backlog', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });

    expect(result.current.cards).toHaveLength(3);
    expect(result.current.cards.map((card) => card.column)).toEqual([
      'backlog',
      'backlog',
      'backlog',
    ]);
    expect(INITIAL_MOCK_CARDS.map((card) => card.title)).toEqual([
      'Feature 1: Premium Dark Hero Page',
      'Feature 2: Secure GitHub OAuth Flow',
      'Feature 3: High-Performance Redis Caching',
    ]);
  });

  it('starts the CoderAgent simulation when a card moves to develop', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });

    act(() => result.current.moveCardToDevelop('mock-1'));

    const card = cardById(result, 'mock-1');
    expect(card.column).toBe('develop');
    expect(card.agent).toBe('coder');
    expect(result.current.guidance.emotion).toBe('thinking');
    expect(result.current.guidance.message).toContain('CoderAgent');
  });

  it('walks develop → testing → failure → develop → testing → review on timers', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });
    act(() => result.current.moveCardToDevelop('mock-1'));

    act(() => vi.advanceTimersByTime(MOCK_TIMINGS.developToTesting));
    expect(cardById(result, 'mock-1').column).toBe('testing');
    expect(cardById(result, 'mock-1').agent).toBe('tester');

    act(() => vi.advanceTimersByTime(MOCK_TIMINGS.testingFailure));
    const failed = cardById(result, 'mock-1');
    expect(failed.column).toBe('develop');
    expect(failed.hasError).toBe(true);
    expect(result.current.guidance.message).toContain('assertion');

    act(() => vi.advanceTimersByTime(MOCK_TIMINGS.refactorPause));
    expect(cardById(result, 'mock-1').column).toBe('testing');
    expect(cardById(result, 'mock-1').hasError).toBe(false);

    act(() => vi.advanceTimersByTime(MOCK_TIMINGS.retestPass));
    const reviewed = cardById(result, 'mock-1');
    expect(reviewed.column).toBe('review');
    expect(
      reviewed.subtasks.some((subtask) => subtask.label === '✓ Tests passed')
    ).toBe(true);
    expect(result.current.isBusy).toBe(false);
  });

  it('deploys from review with a loading window and celebrates', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });
    act(() => result.current.moveCardToDevelop('mock-1'));
    act(() =>
      vi.advanceTimersByTime(
        MOCK_TIMINGS.developToTesting +
          MOCK_TIMINGS.testingFailure +
          MOCK_TIMINGS.refactorPause +
          MOCK_TIMINGS.retestPass
      )
    );

    act(() => result.current.deployCard('mock-1'));
    expect(cardById(result, 'mock-1').isDeploying).toBe(true);

    act(() => vi.advanceTimersByTime(MOCK_TIMINGS.deployDuration));
    const deployed = cardById(result, 'mock-1');
    expect(deployed.column).toBe('deploy');
    expect(deployed.isDeployed).toBe(true);
    expect(result.current.celebratingCardId).toBe('mock-1');
    expect(result.current.guidance.emotion).toBe('happy');
  });

  it('resets the board and cancels pending timers on restart', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });
    act(() => result.current.moveCardToDevelop('mock-1'));
    expect(cardById(result, 'mock-1').column).toBe('develop');
    expect(result.current.isBusy).toBe(true);

    act(() => result.current.restart());

    expect(result.current.cards.map((card) => card.column)).toEqual([
      'backlog',
      'backlog',
      'backlog',
    ]);
    expect(result.current.isBusy).toBe(false);
    expect(result.current.celebratingCardId).toBeNull();
    expect(
      cardById(result, 'mock-1').subtasks.every((subtask) => !subtask.done)
    ).toBe(true);

    // Timers scheduled before the restart must not resurrect the old run.
    act(() => vi.advanceTimersByTime(60_000));
    expect(cardById(result, 'mock-1').column).toBe('backlog');
  });

  it('ignores moves from columns other than the backlog', () => {
    const { result } = renderHook(() => usePlaygroundMock(), { wrapper });
    act(() => result.current.moveCardToDevelop('mock-1'));
    act(() => result.current.moveCardToDevelop('mock-1'));

    expect(cardById(result, 'mock-1').column).toBe('develop');
  });
});

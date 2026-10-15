import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLIPS } from './avatar-clips';
import { AvatarFigure } from './avatar-figure';

const art = () => screen.getByTestId('avatar-pixel-art');

function setReducedMotion(matches: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: matches && q.includes('reduce'),
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as never;
}

describe('AvatarFigure', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  it('advances looping clips frame by frame with timeouts', () => {
    render(<AvatarFigure clip="happy" />);
    expect(art()).toHaveAttribute('data-frame', '0');
    act(() => vi.advanceTimersByTime(1000 / CLIPS.happy.fps + 1));
    expect(art()).toHaveAttribute('data-frame', '1');
    act(() =>
      vi.advanceTimersByTime(
        (1000 / CLIPS.happy.fps) * CLIPS.happy.frames.length,
      ),
    );
    expect(Number(art().getAttribute('data-frame'))).toBeLessThan(
      CLIPS.happy.frames.length,
    );
  });

  it('one-shot clips stop on their last frame and schedule nothing else', () => {
    render(<AvatarFigure clip="surprised" />);
    act(() => vi.advanceTimersByTime(2000));
    expect(art()).toHaveAttribute(
      'data-frame',
      String(CLIPS.surprised.frames.length - 1),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restartKey replays a one-shot clip', () => {
    const { rerender } = render(<AvatarFigure clip="poke" restartKey={1} />);
    act(() => vi.advanceTimersByTime(1000));
    rerender(<AvatarFigure clip="poke" restartKey={2} />);
    expect(art()).toHaveAttribute('data-frame', '0');
  });

  it('shows the static frame and runs no timers with reduced motion', () => {
    setReducedMotion(true);
    render(<AvatarFigure clip="thinking" />);
    expect(art()).toHaveAttribute('data-animated', 'false');
    expect(art()).toHaveAttribute(
      'data-frame',
      String(CLIPS.thinking.staticFrame),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pauses while the tab is hidden', () => {
    render(<AvatarFigure clip="idle" />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(art()).toHaveAttribute('data-animated', 'false');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('blinks and restores the same idle pose', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(
      <AvatarFigure
        clip={{
          frames: [CLIPS.idle.frames[0]],
          fps: 1,
          loop: false,
          staticFrame: 0,
          blink: true,
        }}
      />,
    );
    const open = art().innerHTML;
    act(() => vi.advanceTimersByTime(2400));
    expect(art().innerHTML).not.toBe(open);
    act(() => vi.advanceTimersByTime(120));
    expect(art().innerHTML).toBe(open);
    vi.restoreAllMocks();
  });

  it('applies the face color through currentColor', () => {
    render(<AvatarFigure clip="idle" face="rgb(1, 2, 3)" playing={false} />);
    expect(art().style.color).toBe('rgb(1, 2, 3)');
    expect(art().querySelector('path[fill="currentColor"]')).not.toBeNull();
  });
});

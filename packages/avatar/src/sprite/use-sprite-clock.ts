'use client';

import { useEffect, useRef, useState } from 'react';
import { BLINK, type SpriteClip } from './avatar-clips';

/** True while the tab is visible; animations pause when it is hidden. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

/**
 * Steps through a clip with one timeout per frame (no rAF loop). Returns the
 * frame to draw; when not playing it returns the clip's static frame. One-shot
 * clips stop scheduling once they reach their last frame. Changing `clip` or
 * `restartKey` starts again from frame 0.
 */
export function useClipFrame(
  clip: SpriteClip,
  playing: boolean,
  restartKey: unknown = 0,
): number {
  const [state, setState] = useState({ clip, restartKey, frame: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const current = state.clip === clip && state.restartKey === restartKey;
  const frame = current ? state.frame : 0;
  const last = clip.frames.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    const previous = stateRef.current;
    let frame =
      previous.clip === clip && previous.restartKey === restartKey
        ? previous.frame
        : 0;
    if (!clip.loop && frame >= last) return undefined;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      frame = clip.loop
        ? (frame + 1) % clip.frames.length
        : Math.min(frame + 1, last);
      const next = { clip, restartKey, frame };
      stateRef.current = next;
      setState(next);
      if (clip.loop || frame < last)
        timer = setTimeout(advance, 1000 / clip.fps);
    };
    timer = setTimeout(advance, 1000 / clip.fps);
    return () => clearTimeout(timer);
  }, [clip, restartKey, last, playing]);

  return playing ? Math.min(frame, last) : clip.staticFrame;
}

/** Random blinking while `enabled`; returns true while the eyes are shut. */
export function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setClosed(false);
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const gap =
        BLINK.minGapMs + Math.random() * (BLINK.maxGapMs - BLINK.minGapMs);
      timer = setTimeout(() => {
        setClosed(true);
        timer = setTimeout(() => {
          setClosed(false);
          schedule();
        }, BLINK.closedMs);
      }, gap);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [enabled]);
  return enabled && closed;
}

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/** Live `prefers-reduced-motion` preference (false during SSR). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia(REDUCED_QUERY);
    const update = () => setReduced(!!query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

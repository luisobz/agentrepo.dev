'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AvatarSetup } from '../avatar-setup';
import {
  useAvatar,
  type AvatarMessagePlacement,
  type AvatarSlotId,
} from './avatar-context';
import { AvatarSprite } from './avatar-sprite';

const SPRITE_SIZE = 48;
const BUBBLE_GAP = 10;
const VIEWPORT_PADDING = 8;

interface Point {
  x: number;
  y: number;
  s: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function sampleFlight(
  from: Point,
  dest: Point,
  t: number,
  setup: AvatarSetup
): { pos: Point; opacity: number } {
  if (setup.movement === 'fade') {
    const pos = t < 0.5 ? from : dest;
    const opacity = t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2;
    return { pos, opacity };
  }

  const eased =
    setup.movement === 'linear'
      ? t
      : setup.movement === 'bounce'
        ? easeOutBack(t)
        : easeInOutCubic(t);

  const pos: Point = {
    x: lerp(from.x, dest.x, eased),
    y: lerp(from.y, dest.y, eased),
    s: lerp(from.s, dest.s, eased),
  };
  if (setup.movement === 'jump') {
    pos.y -= Math.sin(Math.PI * t) * setup.jumpArc;
  }
  return { pos, opacity: 1 };
}

/** Places the bubble on the requested side of the avatar, flipping to the
 * opposite side and clamping so it never leaves the viewport. */
function placeBubble(
  cx: number,
  cy: number,
  halfSprite: number,
  bw: number,
  bh: number,
  placement: AvatarMessagePlacement,
  vw: number,
  vh: number
): { x: number; y: number } {
  const pad = VIEWPORT_PADDING;
  const gap = BUBBLE_GAP;
  const below = () => ({ x: cx - bw / 2, y: cy + halfSprite + gap });
  const above = () => ({ x: cx - bw / 2, y: cy - halfSprite - gap - bh });
  const rightOf = () => ({ x: cx + halfSprite + gap, y: cy - bh / 2 });
  const leftOf = () => ({ x: cx - halfSprite - gap - bw, y: cy - bh / 2 });

  let p: { x: number; y: number };
  if (placement === 'top') {
    p = above();
    if (p.y < pad) p = below();
  } else if (placement === 'left') {
    p = leftOf();
    if (p.x < pad) p = rightOf();
  } else if (placement === 'right') {
    p = rightOf();
    if (p.x + bw > vw - pad) p = leftOf();
  } else {
    // 'bottom' and 'auto' default below, flipping up when there's no room.
    p = below();
    if (p.y + bh > vh - pad) p = above();
  }

  return {
    x: clamp(p.x, pad, Math.max(pad, vw - bw - pad)),
    y: clamp(p.y, pad, Math.max(pad, vh - bh - pad)),
  };
}

const isElementOnScreen = (el: HTMLElement) => {
  if (el.offsetParent === null) return false;
  const r = el.getBoundingClientRect();
  return (
    r.bottom >= 0 &&
    r.top <= window.innerHeight &&
    r.right >= 0 &&
    r.left <= window.innerWidth
  );
};

/**
 * Renders the single moving avatar (with its badge and speech bubble) in a
 * viewport-fixed portal, flies it between slots in screen coordinates, keeps it
 * on-screen (retreating to a fallback slot and flying back when its slot
 * returns), and reports arrival so messages only show once it has landed.
 */
export function AvatarStage() {
  const {
    currentSlot,
    slotsRef,
    slotVersion,
    setup,
    currentMessage,
    badge,
    reportArrival,
    setAvatarPosition,
    dismissMessage,
  } = useAvatar();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const posRef = useRef<Point | null>(null);
  const prevElRef = useRef<HTMLElement | null>(null);
  const flightRef = useRef<{ from: Point; t0: number; dur: number } | null>(
    null
  );
  const offscreenSinceRef = useRef<number | null>(null);
  const pendingReturnRef = useRef<AvatarSlotId | null>(null);
  const arrivedRef = useRef(true);

  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;
  const setupRef = useRef(setup);
  setupRef.current = setup;
  const currentSlotRef = useRef(currentSlot);
  currentSlotRef.current = currentSlot;
  const reportArrivalRef = useRef(reportArrival);
  reportArrivalRef.current = reportArrival;
  const setPositionRef = useRef(setAvatarPosition);
  setPositionRef.current = setAvatarPosition;

  const active = currentSlot ? slotsRef.current.get(currentSlot) : undefined;
  const activeRef = useRef(active);
  activeRef.current = active;
  void slotVersion;

  const hasMessage = currentMessage !== null;
  const messagePlacement = currentMessage?.placement ?? 'auto';
  const placementRef = useRef<AvatarMessagePlacement>(messagePlacement);
  placementRef.current = messagePlacement;

  useEffect(() => setMounted(true), []);

  // Leaving the fallback slot (by return or by an app-initiated move) resolves
  // any pending return.
  useEffect(() => {
    if (currentSlot !== setup.fallbackSlot) {
      pendingReturnRef.current = null;
    }
  }, [currentSlot, setup.fallbackSlot]);

  const setArrived = (next: boolean) => {
    if (arrivedRef.current !== next) {
      arrivedRef.current = next;
      reportArrivalRef.current(next);
    }
  };

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    let raf = 0;
    const tick = (now: number) => {
      const wrap = wrapperRef.current;
      const bubble = bubbleRef.current;
      const target = activeRef.current;
      const config = setupRef.current;
      const hideBubble = () => {
        if (bubble) bubble.style.visibility = 'hidden';
      };

      // If parked at the fallback, watch for the original slot coming back.
      const pending = pendingReturnRef.current;
      if (pending && currentSlotRef.current === config.fallbackSlot) {
        const returnTarget = slotsRef.current.get(pending);
        if (returnTarget && isElementOnScreen(returnTarget.el)) {
          pendingReturnRef.current = null;
          setPositionRef.current(pending);
        }
      }

      if (!wrap || !target?.el) {
        if (wrap) wrap.style.visibility = 'hidden';
        hideBubble();
        posRef.current = null;
        prevElRef.current = null;
        offscreenSinceRef.current = null;
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = target.el.getBoundingClientRect();
      const rendered =
        rect.width > 0 && rect.height > 0 && target.el.offsetParent !== null;
      if (!rendered) {
        wrap.style.visibility = 'hidden';
        hideBubble();
        posRef.current = null;
        prevElRef.current = target.el;
        offscreenSinceRef.current = null;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dest: Point = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        s: target.scale,
      };

      if (prevElRef.current !== target.el) {
        if (posRef.current && !reducedRef.current) {
          const dist = Math.hypot(
            dest.x - posRef.current.x,
            dest.y - posRef.current.y
          );
          const rawDur = config.durationBaseMs + dist * config.durationPerPxMs;
          flightRef.current = {
            from: posRef.current,
            t0: now,
            dur:
              clamp(rawDur, config.durationMinMs, config.durationMaxMs) /
              Math.max(config.speed, 0.05),
          };
        } else {
          posRef.current = dest;
          flightRef.current = null;
        }
        prevElRef.current = target.el;
      }

      let opacity = 1;
      const flight = flightRef.current;
      if (flight) {
        const t = (now - flight.t0) / flight.dur;
        if (t >= 1) {
          posRef.current = dest;
          flightRef.current = null;
        } else {
          const sampled = sampleFlight(flight.from, dest, t, config);
          posRef.current = sampled.pos;
          opacity = sampled.opacity;
        }
      } else {
        posRef.current = dest;
      }

      const pos = posRef.current;
      wrap.style.visibility = 'visible';
      wrap.style.opacity = String(opacity);
      wrap.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${pos.s}) translate(-50%, -50%)`;

      // Keep the avatar on-screen: retreat to the fallback slot after a beat.
      const onScreen =
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth;
      if (onScreen) {
        offscreenSinceRef.current = null;
      } else if (
        config.fallbackSlot &&
        currentSlotRef.current !== config.fallbackSlot
      ) {
        if (offscreenSinceRef.current === null) {
          offscreenSinceRef.current = now;
        } else if (now - offscreenSinceRef.current > config.offscreenFallbackMs) {
          offscreenSinceRef.current = null;
          pendingReturnRef.current = currentSlotRef.current;
          setPositionRef.current(config.fallbackSlot);
        }
      }

      const arrived = flightRef.current === null && onScreen;
      setArrived(arrived);

      if (bubble) {
        if (hasMessage && arrived) {
          const halfSprite = (SPRITE_SIZE / 2) * pos.s;
          const b = placeBubble(
            pos.x,
            pos.y,
            halfSprite,
            bubble.offsetWidth,
            bubble.offsetHeight,
            placementRef.current,
            window.innerWidth,
            window.innerHeight
          );
          bubble.style.visibility = 'visible';
          bubble.style.transform = `translate(${b.x}px, ${b.y}px)`;
        } else {
          bubble.style.visibility = 'hidden';
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, hasMessage, slotsRef]);

  if (!mounted || typeof document === 'undefined' || !active) {
    return null;
  }

  return createPortal(
    <>
      <div
        ref={wrapperRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
          zIndex: 120,
          visibility: 'hidden',
          willChange: 'transform',
          transformOrigin: '0 0',
        }}
      >
        <AvatarSprite />
        {badge !== null ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9,
              fontSize: 10,
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--color-bg-warm-white, #fff)',
              backgroundColor: 'var(--color-brand-garnet, #7a2230)',
              boxShadow: '0 0 0 2px var(--color-bg-surface, #1b1714)',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </div>
      {hasMessage ? (
        <div
          ref={bubbleRef}
          role="status"
          aria-live="polite"
          onClick={dismissMessage}
          title="Cerrar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 121,
            maxWidth: 'min(18rem, calc(100vw - 16px))',
            visibility: 'hidden',
            cursor: 'pointer',
            willChange: 'transform',
            transformOrigin: '0 0',
            padding: '8px 12px',
            borderRadius: 14,
            fontSize: 13,
            lineHeight: 1.4,
            backgroundColor: 'var(--color-bg-warm-white, #fff)',
            color: 'var(--color-text-primary, #1a1a1a)',
            border: '1px solid var(--color-border-soft, rgba(0,0,0,0.1))',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          }}
        >
          {currentMessage?.text}
        </div>
      ) : null}
    </>,
    document.body
  );
}

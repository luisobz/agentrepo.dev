'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AvatarSetup } from '../avatar-setup';
import { CLIPS, clipDurationMs } from '../sprite/avatar-clips';
import {
  useAvatar,
  type AvatarMessagePlacement,
  type AvatarSlotId,
} from './avatar-context';
import { AvatarSprite, type AvatarTravel } from './avatar-sprite';
import { placeBubble, type Rect } from './bubble-placement';
import { usePrefersReducedMotion } from '../sprite/use-sprite-clock';

const SPRITE_SIZE = 48;
/** Anticipation before take-off (ms, before the speed multiplier). */
const TAKEOFF_MS = 110;
/** Fraction of the flight after which the character is "flying". */
const FLY_AT = 0.12;
/** Frames without movement before the loop goes to sleep. */
const SETTLE_FRAMES = 12;
/** Interactive elements a bubble should not cover. */
const CONTROL_SELECTOR =
  'a[href],button,input,select,textarea,summary,[role="button"],[role="tab"],[role="menuitem"],[tabindex]:not([tabindex="-1"])';
const OBSTACLE_TTL_MS = 250;

interface Point {
  x: number;
  y: number;
  s: number;
}

interface Flight {
  from: Point;
  t0: number;
  /** Anticipation (ms) before the position starts changing. */
  hold: number;
  dur: number;
  /** Retargeted mid-air: start at speed instead of from rest. */
  retarget: boolean;
  dir: -1 | 0 | 1;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function sampleFlight(
  from: Point,
  dest: Point,
  t: number,
  setup: AvatarSetup,
  retarget = false,
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
        : retarget
          ? easeOutCubic(t)
          : easeInOutCubic(t);
  const pos: Point = {
    x: lerp(from.x, dest.x, eased),
    y: lerp(from.y, dest.y, eased),
    // Scale never overshoots, even with 'bounce'.
    s: lerp(from.s, dest.s, clamp(eased, 0, 1)),
  };
  if (setup.movement === 'jump') {
    pos.y -= Math.sin(Math.PI * t) * setup.jumpArc;
  }
  return { pos, opacity: 1 };
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

/** Rects of visible interactive controls, ignoring the avatar's own portal. */
function collectObstacles(exclude: (Element | null)[]): Rect[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rects: Rect[] = [];
  document.querySelectorAll<HTMLElement>(CONTROL_SELECTOR).forEach((el) => {
    if (exclude.some((root) => root && root.contains(el))) return;
    if (el.closest('[aria-hidden="true"],[inert]')) return;
    const style = getComputedStyle(el);
    if (
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0'
    )
      return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
    rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  });
  return rects;
}

export const AVATAR_STAGE_CSS = `
.ar-bubble{position:fixed;top:0;left:0;z-index:121;max-width:min(18rem,calc(100vw - 16px));visibility:hidden;cursor:pointer;will-change:transform}
.ar-bubble-inner{position:relative;padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.4;overflow-wrap:anywhere;background:var(--color-bg-warm-white,#fff);color:var(--color-text-primary,#1a1a1a);border:1px solid var(--color-border-soft,rgba(0,0,0,.1));box-shadow:0 8px 30px rgba(0,0,0,.18)}
.ar-bubble-content{max-height:calc(100dvh - 48px);overflow-y:auto}\n.ar-bubble-inner::after{content:"";position:absolute;width:10px;height:10px;background:inherit;border-style:solid;border-color:var(--color-border-soft,rgba(0,0,0,.1));border-width:0 1px 1px 0;transform:rotate(45deg)}
.ar-bubble[data-side=bottom] .ar-bubble-inner::after{top:-6px;left:calc(var(--ar-tail,50%) - 5px);transform:rotate(225deg)}
.ar-bubble[data-side=top] .ar-bubble-inner::after{bottom:-6px;left:calc(var(--ar-tail,50%) - 5px)}
.ar-bubble[data-side=left] .ar-bubble-inner::after{right:-6px;top:calc(var(--ar-tail,50%) - 5px);transform:rotate(-45deg)}
.ar-bubble[data-side=right] .ar-bubble-inner::after{left:-6px;top:calc(var(--ar-tail,50%) - 5px);transform:rotate(135deg)}
.ar-bubble[data-visible=true] .ar-bubble-inner{animation:ar-bubble-pop .22s cubic-bezier(.2,1.4,.4,1) both}
.ar-bubble[data-side=bottom] .ar-bubble-inner{transform-origin:var(--ar-tail,50%) 0}
.ar-bubble[data-side=top] .ar-bubble-inner{transform-origin:var(--ar-tail,50%) 100%}
.ar-bubble[data-side=left] .ar-bubble-inner{transform-origin:100% var(--ar-tail,50%)}
.ar-bubble[data-side=right] .ar-bubble-inner{transform-origin:0 var(--ar-tail,50%)}
@keyframes ar-bubble-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.ar-bubble[data-visible=true] .ar-bubble-inner{animation:none}}
`;

/**
 * Renders the single moving avatar (with its badge and speech bubble) in a
 * viewport-fixed portal, flies it between slots in screen coordinates, keeps it
 * on-screen (retreating to a fallback slot and flying back when its slot
 * returns), and reports arrival so messages only show once it has landed.
 *
 * The rAF loop only runs while something can change: it sleeps once the avatar
 * has settled and is woken by scroll, resize, layout/animation changes, slot or
 * message updates, and pauses entirely while the tab is hidden.
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
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [travel, setTravel] = useState<AvatarTravel | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const posRef = useRef<Point | null>(null);
  const prevElRef = useRef<HTMLElement | null>(null);
  const flightRef = useRef<Flight | null>(null);
  const offscreenSinceRef = useRef<number | null>(null);
  const pendingReturnRef = useRef<AvatarSlotId | null>(null);
  const arrivedRef = useRef(true);
  const wakeRef = useRef<() => void>(() => undefined);
  const travelRef = useRef<AvatarTravel | null>(null);
  const landTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const obstaclesRef = useRef<{ at: number; rects: Rect[] }>({
    at: -Infinity,
    rects: [],
  });
  const bubbleShownRef = useRef(false);

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

  const hasMessage = currentMessage !== null;
  const messageId = currentMessage?.id ?? null;
  const messagePlacement = currentMessage?.placement ?? 'auto';
  const placementRef = useRef<AvatarMessagePlacement>(messagePlacement);
  placementRef.current = messagePlacement;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (currentSlot !== setup.fallbackSlot) {
      pendingReturnRef.current = null;
    }
  }, [currentSlot, setup.fallbackSlot]);

  useEffect(
    () => () => {
      if (landTimerRef.current) clearTimeout(landTimerRef.current);
    },
    [],
  );

  const setArrived = (next: boolean) => {
    if (arrivedRef.current !== next) {
      arrivedRef.current = next;
      reportArrivalRef.current(next);
    }
  };

  /** Updates the acting phase only when it changes (a handful of renders per flight). */
  const setPhase = (next: AvatarTravel | null) => {
    const prev = travelRef.current;
    if (prev?.phase === next?.phase && prev?.dir === next?.dir) return;
    travelRef.current = next;
    if (landTimerRef.current) {
      clearTimeout(landTimerRef.current);
      landTimerRef.current = null;
    }
    setTravel(next);
    if (next?.phase === 'land') {
      landTimerRef.current = setTimeout(() => {
        travelRef.current = null;
        setTravel(null);
      }, clipDurationMs(CLIPS.land));
    }
  };

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    let raf = 0;
    let stillFrames = 0;
    let last = { x: NaN, y: NaN, s: NaN, o: NaN };

    const tick = (now: number) => {
      raf = 0;
      const wrap = wrapperRef.current;
      const bubble = bubbleRef.current;
      const target = activeRef.current;
      const config = setupRef.current;
      let keepAwake = false;
      const hideBubble = () => {
        if (bubble) {
          bubble.style.visibility = 'hidden';
          bubble.dataset.visible = 'false';
        }
        bubbleShownRef.current = false;
      };

      const pending = pendingReturnRef.current;
      if (pending && currentSlotRef.current === config.fallbackSlot) {
        const returnTarget = slotsRef.current.get(pending);
        if (returnTarget && isElementOnScreen(returnTarget.el)) {
          pendingReturnRef.current = null;
          setPositionRef.current(pending);
        }
      }

      const rect = target?.el ? target.el.getBoundingClientRect() : null;
      if (
        !wrap ||
        !target ||
        !rect ||
        rect.width === 0 ||
        rect.height === 0 ||
        target.el.offsetParent === null
      ) {
        if (wrap) wrap.style.visibility = 'hidden';
        hideBubble();
        posRef.current = null;
        prevElRef.current = target?.el ?? null;
        offscreenSinceRef.current = null;
        flightRef.current = null;
        setPhase(null);
        return;
      }

      const dest: Point = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        s: target.scale,
      };

      if (prevElRef.current !== target.el) {
        if (posRef.current && !reducedRef.current) {
          const from = posRef.current;
          const dx = dest.x - from.x;
          const dist = Math.hypot(dx, dest.y - from.y);
          const speed = Math.max(config.speed, 0.05);
          const rawDur = config.durationBaseMs + dist * config.durationPerPxMs;
          const retarget = flightRef.current !== null;
          flightRef.current = {
            from,
            t0: now,
            hold:
              retarget || config.movement === 'fade' ? 0 : TAKEOFF_MS / speed,
            dur:
              clamp(rawDur, config.durationMinMs, config.durationMaxMs) / speed,
            retarget,
            dir: Math.abs(dx) < 8 ? 0 : dx > 0 ? 1 : -1,
          };
        } else {
          posRef.current = dest;
          flightRef.current = null;
        }
        prevElRef.current = target.el;
      }

      if (reducedRef.current) {
        posRef.current = dest;
        flightRef.current = null;
        setPhase(null);
      }

      let opacity = 1;
      const flight = flightRef.current;
      if (flight) {
        keepAwake = true;
        const elapsed = now - flight.t0 - flight.hold;
        const t = elapsed / flight.dur;
        if (t >= 1) {
          posRef.current = dest;
          flightRef.current = null;
          setPhase(
            config.movement === 'fade'
              ? null
              : { phase: 'land', dir: flight.dir },
          );
        } else if (t < 0) {
          posRef.current = flight.from;
          setPhase({ phase: 'takeoff', dir: flight.dir });
        } else {
          const sampled = sampleFlight(
            flight.from,
            dest,
            t,
            config,
            flight.retarget,
          );
          posRef.current = sampled.pos;
          opacity = sampled.opacity;
          if (config.movement !== 'fade' && (t >= FLY_AT || flight.retarget)) {
            setPhase({ phase: 'fly', dir: flight.dir });
          }
        }
      } else {
        posRef.current = dest;
      }

      const pos = posRef.current ?? dest;
      wrap.style.visibility = 'visible';
      if (opacity !== last.o) wrap.style.opacity = String(opacity);
      // Whole pixels keep the pixel art crisp while it travels.
      const px = Math.round(pos.x);
      const py = Math.round(pos.y);
      wrap.style.transform = `translate(${px}px, ${py}px) scale(${pos.s}) translate(-50%, -50%)`;

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
        keepAwake = true;
        if (offscreenSinceRef.current === null) {
          offscreenSinceRef.current = now;
        } else if (
          now - offscreenSinceRef.current >
          config.offscreenFallbackMs
        ) {
          offscreenSinceRef.current = null;
          pendingReturnRef.current = currentSlotRef.current;
          setPositionRef.current(config.fallbackSlot);
        }
      }

      const arrived = flightRef.current === null && onScreen;
      setArrived(arrived);

      const moved =
        Math.abs(px - last.x) +
          Math.abs(py - last.y) +
          Math.abs(pos.s - last.s) >
          0.001 || opacity !== last.o;
      last = { x: px, y: py, s: pos.s, o: opacity };

      if (bubble) {
        if (hasMessage && arrived) {
          if (
            moved ||
            !bubbleShownRef.current ||
            now - obstaclesRef.current.at > OBSTACLE_TTL_MS
          ) {
            if (now - obstaclesRef.current.at > OBSTACLE_TTL_MS) {
              obstaclesRef.current = {
                at: now,
                rects: collectObstacles([wrap, bubble]),
              };
            }
            const b = placeBubble({
              cx: px,
              cy: py,
              half: (SPRITE_SIZE / 2) * pos.s,
              bw: bubble.offsetWidth,
              bh: bubble.offsetHeight,
              placement: placementRef.current,
              vw: window.innerWidth,
              vh: window.innerHeight,
              obstacles: obstaclesRef.current.rects,
            });
            bubble.dataset.side = b.side;
            bubble.style.setProperty('--ar-tail', `${Math.round(b.tail)}px`);
            bubble.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y)}px)`;
          }
          bubble.style.visibility = 'visible';
          if (!bubbleShownRef.current) {
            bubble.dataset.visible = 'true';
            bubbleShownRef.current = true;
          }
        } else {
          hideBubble();
        }
      }

      for (
        let element: HTMLElement | null = target.el;
        element;
        element = element.parentElement
      ) {
        if (
          element
            .getAnimations?.()
            .some((animation) => animation.playState === 'running')
        ) {
          keepAwake = true;
          break;
        }
      }
      stillFrames = moved ? 0 : stillFrames + 1;
      if (keepAwake || stillFrames < SETTLE_FRAMES) {
        if (document.visibilityState !== 'hidden')
          raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      stillFrames = 0;
      if (raf || document.visibilityState === 'hidden') return;
      raf = requestAnimationFrame(tick);
    };
    const wakeLayout = () => {
      obstaclesRef.current.at = -Infinity;
      wake();
    };
    wakeRef.current = wakeLayout;

    const opts = { capture: true, passive: true } as const;
    window.addEventListener('scroll', wakeLayout, opts);
    window.addEventListener('resize', wakeLayout, { passive: true });
    document.addEventListener('visibilitychange', wakeLayout);
    for (const type of [
      'transitionrun',
      'transitionend',
      'animationstart',
      'animationend',
    ] as const) {
      document.addEventListener(type, wakeLayout, opts);
    }
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(wakeLayout)
        : null;
    ro?.observe(document.documentElement);
    if (document.body) ro?.observe(document.body);
    wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('scroll', wakeLayout, opts);
      window.removeEventListener('resize', wakeLayout);
      document.removeEventListener('visibilitychange', wakeLayout);
      for (const type of [
        'transitionrun',
        'transitionend',
        'animationstart',
        'animationend',
      ] as const) {
        document.removeEventListener(type, wakeLayout, opts);
      }
      ro?.disconnect();
      wakeRef.current = () => undefined;
    };
  }, [mounted, hasMessage, slotsRef]);

  // Anything that can move the avatar or its bubble wakes the loop.
  useEffect(() => {
    wakeRef.current();
  }, [currentSlot, slotVersion, messageId, setup, reducedMotion, active]);

  // A slot element resizing (e.g. a menu sliding in) also wakes it.
  useEffect(() => {
    const el = active?.el;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => wakeRef.current());
    ro.observe(el);
    const mutations = new MutationObserver(() => wakeRef.current());
    for (
      let element: HTMLElement | null = el;
      element;
      element = element.parentElement
    ) {
      mutations.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }
    return () => {
      ro.disconnect();
      mutations.disconnect();
    };
  }, [active]);

  // A new message pops in again.
  useEffect(() => {
    bubbleShownRef.current = false;
    if (bubbleRef.current) bubbleRef.current.dataset.visible = 'false';
  }, [messageId]);

  if (!mounted || typeof document === 'undefined' || !active) {
    return null;
  }

  return createPortal(
    <>
      <style href="agentrepo-avatar-stage" precedence="default">
        {AVATAR_STAGE_CSS}
      </style>
      <div
        ref={wrapperRef}
        data-testid="avatar-stage"
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
        <AvatarSprite travel={reducedMotion ? null : travel} />
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
              pointerEvents: 'none',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </div>
      {hasMessage ? (
        <div
          ref={bubbleRef}
          className="ar-bubble"
          role="status"
          aria-live="polite"
          data-testid="avatar-bubble"
          data-side="bottom"
          data-visible="false"
          onClick={dismissMessage}
          title="Cerrar"
        >
          <div className="ar-bubble-inner">
            <div className="ar-bubble-content">{currentMessage?.text}</div>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}

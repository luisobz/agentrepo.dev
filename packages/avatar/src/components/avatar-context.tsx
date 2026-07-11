'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  DEFAULT_AVATAR_SETUP,
  mergeAvatarSetup,
  type AvatarSetup,
  type AvatarSetupInput,
} from '../avatar-setup';
import { AvatarStage } from './avatar-stage';

export type AvatarEmotion = 'idle' | 'happy' | 'thinking' | 'surprised';
export type AvatarSlotId = 'header' | 'footer' | 'sidebar' | (string & {});

/** A mounted slot the avatar can dock into: its element and render scale. */
export interface AvatarSlotTarget {
  el: HTMLElement;
  scale: number;
}

/** Where the speech bubble sits relative to the avatar. `auto` picks the side
 * with room (defaulting to below, flipping above when it would overflow). */
export type AvatarMessagePlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'auto';

/** A queued speech-bubble message. `durationMs === null` means it stays until
 * the visitor dismisses it (by clicking the avatar or the bubble). */
export interface AvatarMessage {
  id: string;
  text: string;
  durationMs: number | null;
  placement: AvatarMessagePlacement;
}

/** Options for {@link AvatarContextValue.say}. */
export interface AvatarSayOptions {
  durationMs?: number | null;
  placement?: AvatarMessagePlacement;
}

/** Default lifetime of a message when a duration is not supplied. */
export const DEFAULT_MESSAGE_MS = 5000;

export interface AvatarContextValue {
  currentSlot: AvatarSlotId | null;
  emotion: AvatarEmotion;
  isShaking: boolean;
  setAvatarPosition: (slot: AvatarSlotId | null) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  registerAvatarClick: () => void;
  /** Live registry of mounted slot targets, keyed by slot id. */
  slotsRef: MutableRefObject<Map<AvatarSlotId, AvatarSlotTarget>>;
  /** Bumped whenever the registry changes so the stage re-derives the target. */
  slotVersion: number;
  /** Registers a mounted slot; returns an unregister cleanup. */
  registerSlot: (
    id: AvatarSlotId,
    el: HTMLElement,
    scale: number
  ) => () => void;
  /** Current avatar configuration (speed, movement, colors). */
  setup: AvatarSetup;
  /** Mutates the avatar setup at runtime, merging over the current values. */
  configureAvatar: (input: AvatarSetupInput) => void;
  /** The message currently being spoken (shown once the avatar has arrived). */
  currentMessage: AvatarMessage | null;
  /**
   * Queues a message. It is only shown once the avatar has arrived at its slot,
   * and multiple messages are consumed one after another. `durationMs` sets how
   * long it stays (default {@link DEFAULT_MESSAGE_MS}); pass `null` to keep it
   * until the visitor dismisses it by clicking the avatar or the bubble.
   * `placement` controls which side of the avatar the bubble appears on.
   */
  say: (text: string, options?: AvatarSayOptions) => void;
  /** Dismisses the current message and advances to the next queued one. */
  dismissMessage: () => void;
  /** Clears the current message and the whole pending queue. */
  clearMessages: () => void;
  /** A small count badge shown over the avatar (e.g. unread chat messages). */
  badge: number | null;
  /** Sets (or clears with `null`/`0`) the badge count shown over the avatar. */
  setBadge: (badge: number | null) => void;
  /** Internal: the stage reports whether the avatar has settled on its slot. */
  reportArrival: (arrived: boolean) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const AVATAR_DEFAULTS = {
  currentSlot: 'header' as AvatarSlotId,
  emotion: 'idle' as AvatarEmotion,
} as const;

export const AVATAR_CLICK_SEQUENCE = {
  surpriseAt: 3,
  happyAt: 4,
  completeAt: 5,
  surpriseDurationMs: 1500,
  shakeDurationMs: 500,
  idleResetMs: 4000,
} as const;

interface AvatarProviderProps {
  children: ReactNode;
  initialSlot?: AvatarSlotId | null;
  initialEmotion?: AvatarEmotion;
  /** Overrides for the default avatar setup (speed, movement, colors). */
  initialSetup?: AvatarSetupInput;
  /**
   * A line the avatar says when the click sequence first surprises it (the
   * "you found something" moment), before the sequence completes.
   */
  surpriseMessage?: string;
  onSequenceComplete?: () => void;
}

export function AvatarProvider({
  children,
  initialSlot = AVATAR_DEFAULTS.currentSlot,
  initialEmotion = AVATAR_DEFAULTS.emotion,
  initialSetup,
  surpriseMessage,
  onSequenceComplete,
}: AvatarProviderProps) {
  const [currentSlot, setCurrentSlot] = useState<AvatarSlotId | null>(initialSlot);
  const [emotion, setEmotionState] = useState<AvatarEmotion>(initialEmotion);
  const [isShaking, setIsShaking] = useState(false);
  const [setup, setSetup] = useState<AvatarSetup>(() =>
    mergeAvatarSetup(DEFAULT_AVATAR_SETUP, initialSetup)
  );
  const [messageQueue, setMessageQueue] = useState<AvatarMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<AvatarMessage | null>(
    null
  );
  // Whether the avatar has settled on its slot; messages only show once true.
  const [arrived, setArrived] = useState(true);
  const [badge, setBadgeState] = useState<number | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);

  const configureAvatar = useCallback((input: AvatarSetupInput) => {
    setSetup((current) => mergeAvatarSetup(current, input));
  }, []);

  const say = useCallback((text: string, options?: AvatarSayOptions) => {
    const entry: AvatarMessage = {
      id: `msg-${(messageIdRef.current += 1)}`,
      text,
      durationMs:
        options?.durationMs === undefined
          ? DEFAULT_MESSAGE_MS
          : options.durationMs,
      placement: options?.placement ?? 'auto',
    };
    setMessageQueue((queue) => [...queue, entry]);
  }, []);

  const setBadge = useCallback((next: number | null) => {
    setBadgeState(next && next > 0 ? next : null);
  }, []);

  const dismissMessage = useCallback(() => {
    if (messageTimerRef.current !== null) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setCurrentMessage(null);
  }, []);

  const clearMessages = useCallback(() => {
    if (messageTimerRef.current !== null) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setMessageQueue([]);
    setCurrentMessage(null);
  }, []);

  const reportArrival = useCallback((next: boolean) => {
    setArrived((current) => (current === next ? current : next));
  }, []);

  // Consume the queue one message at a time, but only once the avatar arrived.
  useEffect(() => {
    if (arrived && currentMessage === null && messageQueue.length > 0) {
      setCurrentMessage(messageQueue[0]);
      setMessageQueue((queue) => queue.slice(1));
    }
  }, [arrived, currentMessage, messageQueue]);

  // Auto-dismiss timed messages; permanent ones (null) wait for a click.
  useEffect(() => {
    if (currentMessage && currentMessage.durationMs !== null) {
      messageTimerRef.current = setTimeout(
        () => setCurrentMessage(null),
        currentMessage.durationMs
      );
      return () => {
        if (messageTimerRef.current !== null) {
          clearTimeout(messageTimerRef.current);
          messageTimerRef.current = null;
        }
      };
    }
    return undefined;
  }, [currentMessage]);

  const slotsRef = useRef<Map<AvatarSlotId, AvatarSlotTarget>>(new Map());
  const [slotVersion, setSlotVersion] = useState(0);

  const registerSlot = useCallback(
    (id: AvatarSlotId, el: HTMLElement, scale: number) => {
      slotsRef.current.set(id, { el, scale });
      setSlotVersion((version) => version + 1);
      return () => {
        // Only clear if we still own the slot (guards mount/unmount races when
        // the same slot id remounts elsewhere, e.g. the playground chat).
        if (slotsRef.current.get(id)?.el === el) {
          slotsRef.current.delete(id);
          setSlotVersion((version) => version + 1);
        }
      };
    },
    []
  );

  const clickCountRef = useRef(0);
  const surpriseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      for (const timer of [
        surpriseTimerRef,
        shakeTimerRef,
        idleResetTimerRef,
        messageTimerRef,
      ]) {
        if (timer.current !== null) {
          clearTimeout(timer.current);
        }
      }
    };
  }, []);

  const setAvatarPosition = useCallback((slot: AvatarSlotId | null) => {
    setCurrentSlot(slot);
  }, []);

  const setEmotion = useCallback((next: AvatarEmotion) => {
    setEmotionState(next);
  }, []);

  const registerAvatarClick = useCallback(() => {
    if (idleResetTimerRef.current !== null) {
      clearTimeout(idleResetTimerRef.current);
    }
    idleResetTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, AVATAR_CLICK_SEQUENCE.idleResetMs);

    clickCountRef.current += 1;
    const clicks = clickCountRef.current;

    if (clicks === AVATAR_CLICK_SEQUENCE.surpriseAt) {
      setEmotionState('surprised');
      // A timed line (so it never intercepts the next click) that hints the
      // visitor stumbled onto something — keep clicking to reach the portfolio.
      if (surpriseMessage) {
        say(surpriseMessage, { durationMs: 4500 });
      }
      surpriseTimerRef.current = setTimeout(() => {
        setEmotionState(AVATAR_DEFAULTS.emotion);
      }, AVATAR_CLICK_SEQUENCE.surpriseDurationMs);
      return;
    }

    if (clicks === AVATAR_CLICK_SEQUENCE.happyAt) {
      if (surpriseTimerRef.current !== null) {
        clearTimeout(surpriseTimerRef.current);
        surpriseTimerRef.current = null;
      }
      setEmotionState('happy');
      setIsShaking(true);
      shakeTimerRef.current = setTimeout(() => {
        setIsShaking(false);
      }, AVATAR_CLICK_SEQUENCE.shakeDurationMs);
      return;
    }

    if (clicks >= AVATAR_CLICK_SEQUENCE.completeAt) {
      clickCountRef.current = 0;
      onSequenceComplete?.();
    }
  }, [onSequenceComplete, say, surpriseMessage]);

  const value = useMemo<AvatarContextValue>(
    () => ({
      currentSlot,
      emotion,
      isShaking,
      setAvatarPosition,
      setEmotion,
      registerAvatarClick,
      slotsRef,
      slotVersion,
      registerSlot,
      setup,
      configureAvatar,
      currentMessage,
      say,
      dismissMessage,
      clearMessages,
      badge,
      setBadge,
      reportArrival,
    }),
    [
      currentSlot,
      emotion,
      isShaking,
      setAvatarPosition,
      setEmotion,
      registerAvatarClick,
      slotVersion,
      registerSlot,
      setup,
      configureAvatar,
      currentMessage,
      say,
      dismissMessage,
      clearMessages,
      badge,
      setBadge,
      reportArrival,
    ],
  );

  return (
    <AvatarContext.Provider value={value}>
      {children}
      <AvatarStage />
    </AvatarContext.Provider>
  );
}

export function useAvatar(): AvatarContextValue {
  const ctx = useContext(AvatarContext);
  if (ctx === null) {
    throw new Error('useAvatar must be used within an <AvatarProvider>');
  }
  return ctx;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AvatarEmotion = 'idle' | 'happy' | 'thinking' | 'surprised';
export type AvatarSlotId = 'header' | 'footer' | 'sidebar' | (string & {});

export interface AvatarContextValue {
  currentSlot: AvatarSlotId | null;
  emotion: AvatarEmotion;
  isShaking: boolean;
  setAvatarPosition: (slot: AvatarSlotId | null) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  registerAvatarClick: () => void;
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
  onSequenceComplete?: () => void;
}

export function AvatarProvider({
  children,
  initialSlot = AVATAR_DEFAULTS.currentSlot,
  initialEmotion = AVATAR_DEFAULTS.emotion,
  onSequenceComplete,
}: AvatarProviderProps) {
  const [currentSlot, setCurrentSlot] = useState<AvatarSlotId | null>(initialSlot);
  const [emotion, setEmotionState] = useState<AvatarEmotion>(initialEmotion);
  const [isShaking, setIsShaking] = useState(false);

  const clickCountRef = useRef(0);
  const surpriseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      for (const timer of [surpriseTimerRef, shakeTimerRef, idleResetTimerRef]) {
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
  }, [onSequenceComplete]);

  const value = useMemo<AvatarContextValue>(
    () => ({
      currentSlot,
      emotion,
      isShaking,
      setAvatarPosition,
      setEmotion,
      registerAvatarClick,
    }),
    [currentSlot, emotion, isShaking, setAvatarPosition, setEmotion, registerAvatarClick],
  );

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
}

export function useAvatar(): AvatarContextValue {
  const ctx = useContext(AvatarContext);
  if (ctx === null) {
    throw new Error('useAvatar must be used within an <AvatarProvider>');
  }
  return ctx;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AvatarEmotion = 'idle' | 'happy' | 'thinking' | 'surprised';
export type AvatarSlotId = 'header' | 'footer' | 'sidebar' | (string & {});

export interface AvatarContextValue {
  currentSlot: AvatarSlotId | null;
  emotion: AvatarEmotion;
  setAvatarPosition: (slot: AvatarSlotId | null) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const AVATAR_DEFAULTS = {
  currentSlot: 'header' as AvatarSlotId,
  emotion: 'idle' as AvatarEmotion,
} as const;

interface AvatarProviderProps {
  children: ReactNode;
  initialSlot?: AvatarSlotId | null;
  initialEmotion?: AvatarEmotion;
}

export function AvatarProvider({
  children,
  initialSlot = AVATAR_DEFAULTS.currentSlot,
  initialEmotion = AVATAR_DEFAULTS.emotion,
}: AvatarProviderProps) {
  const [currentSlot, setCurrentSlot] = useState<AvatarSlotId | null>(initialSlot);
  const [emotion, setEmotionState] = useState<AvatarEmotion>(initialEmotion);

  const setAvatarPosition = useCallback((slot: AvatarSlotId | null) => {
    setCurrentSlot(slot);
  }, []);

  const setEmotion = useCallback((next: AvatarEmotion) => {
    setEmotionState(next);
  }, []);

  const value = useMemo<AvatarContextValue>(
    () => ({ currentSlot, emotion, setAvatarPosition, setEmotion }),
    [currentSlot, emotion, setAvatarPosition, setEmotion],
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

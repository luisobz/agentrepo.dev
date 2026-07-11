'use client';

import { useEffect, useRef } from 'react';
import { useAvatar, type AvatarSlotId } from './avatar-context';

interface AvatarSlotProps {
  id: AvatarSlotId;
  className?: string;
  preserveSpace?: boolean;
  /** Visual scale the avatar takes while docked here (1 = full 48px). */
  scale?: number;
}

/**
 * A docking point for the avatar. The moving sprite itself lives in a
 * viewport-fixed portal (see {@link AvatarStage}); this component reserves the
 * layout box and registers it as a target. Slots register even while inactive
 * (using a zero-size marker when they don't reserve space) so the stage can
 * fly the avatar back once a slot scrolls back into view.
 */
export function AvatarSlot({
  id,
  className,
  preserveSpace = true,
  scale = 1,
}: AvatarSlotProps) {
  const { currentSlot, registerSlot } = useAvatar();
  const boxRef = useRef<HTMLDivElement>(null);
  const isActive = currentSlot === id;

  useEffect(() => {
    if (!boxRef.current) {
      return undefined;
    }
    return registerSlot(id, boxRef.current, scale);
  }, [id, scale, registerSlot]);

  const reserveSpace = isActive || preserveSpace;

  return (
    <div data-testid={`avatar-slot-${id}`} data-active={isActive} className={className}>
      <div
        ref={boxRef}
        aria-hidden="true"
        className={reserveSpace ? 'size-12' : 'size-0'}
      />
    </div>
  );
}

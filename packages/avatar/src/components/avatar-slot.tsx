'use client';

import { useAvatar, type AvatarSlotId } from './avatar-context';
import { AvatarSprite } from './avatar-sprite';

interface AvatarSlotProps {
  id: AvatarSlotId;
  className?: string;
  preserveSpace?: boolean;
}

export function AvatarSlot({ id, className, preserveSpace = true }: AvatarSlotProps) {
  const { currentSlot } = useAvatar();
  const isActive = currentSlot === id;

  return (
    <div
      data-testid={`avatar-slot-${id}`}
      data-active={isActive}
      className={className}
    >
      {isActive ? (
        <AvatarSprite />
      ) : preserveSpace ? (
        <div aria-hidden="true" className="size-12 invisible" />
      ) : null}
    </div>
  );
}

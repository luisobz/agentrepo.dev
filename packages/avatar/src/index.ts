export { AvatarProvider, useAvatar } from './components/avatar-context';
export { AvatarSprite } from './components/avatar-sprite';
export { AvatarSlot } from './components/avatar-slot';
export type {
  AvatarEmotion,
  AvatarSlotId,
  AvatarContextValue,
  AvatarSlotTarget,
  AvatarMessage,
  AvatarMessagePlacement,
  AvatarSayOptions,
} from './components/avatar-context';
export { DEFAULT_AVATAR_SETUP, mergeAvatarSetup } from './avatar-setup';
export type {
  AvatarSetup,
  AvatarSetupInput,
  AvatarMovement,
  AvatarColors,
} from './avatar-setup';
export { AvatarFigure } from './sprite/avatar-figure';
export type { AvatarFigureProps } from './sprite/avatar-figure';
export { CLIPS, SPRITE_SHEET, BLINK } from './sprite/avatar-clips';
export type { ClipName, Pose, SpriteClip } from './sprite/avatar-clips';
export type {
  AvatarTravel,
  AvatarTravelPhase,
  AvatarSpriteProps,
} from './components/avatar-sprite';

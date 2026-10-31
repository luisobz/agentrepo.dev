'use client';
import type { AvatarCharacterId } from '../characters';
import { characterSheet } from '../characters';
import { AvatarFigure } from './avatar-figure';
import { CLIPS, type ClipName } from './avatar-clips';
import {
  useClipFrame,
  usePageVisible,
  usePrefersReducedMotion,
} from './use-sprite-clock';

export interface CharacterFigureProps {
  character: AvatarCharacterId;
  clip?: ClipName;
  playing?: boolean;
  size?: number;
  assetBase?: string;
}
function RasterFigure({
  character,
  clip = 'idle',
  playing = true,
  size = 48,
  assetBase,
}: CharacterFigureProps & { character: Exclude<AvatarCharacterId, 'repo'> }) {
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  const animation = CLIPS[clip];
  const animate = playing && visible && !reduced;
  const frame = useClipFrame(animation, animate);
  const row = Object.keys(CLIPS).indexOf(clip);
  return (
    <svg
      width={size}
      height={(size * 36) / 32}
      viewBox="0 0 32 36"
      aria-hidden="true"
      focusable="false"
      overflow="hidden"
      data-character={character}
      data-clip={clip}
      data-frame={frame}
      data-animated={animate}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        overflow: 'hidden',
      }}
    >
      <image
        href={characterSheet(character, assetBase)}
        x={-frame * 32}
        y={-row * 36}
        width={256}
        height={288}
        style={{ imageRendering: 'pixelated' }}
      />
    </svg>
  );
}
export function CharacterFigure(props: CharacterFigureProps) {
  if (props.character === 'repo')
    return (
      <AvatarFigure
        clip={props.clip ?? 'idle'}
        playing={props.playing}
        size={props.size}
      />
    );
  return <RasterFigure {...props} character={props.character} />;
}

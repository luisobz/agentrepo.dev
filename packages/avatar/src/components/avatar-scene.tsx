'use client';
import { useEffect, useRef, useState } from 'react';
import type { AvatarCharacterId } from '../characters';
import { CharacterFigure } from '../sprite/character-figure';
import { useOptionalAvatar } from './avatar-context';
export interface AvatarActor {
  character: AvatarCharacterId;
  label: string;
  message: string;
}
export type AvatarCast =
  | readonly [AvatarActor]
  | readonly [AvatarActor, AvatarActor];
export interface AvatarSceneProps {
  actors: AvatarCast;
  label?: string;
  assetBase?: string;
}
export function AvatarScene({
  actors,
  label = 'Characters',
  assetBase,
}: AvatarSceneProps) {
  const host = useOptionalAvatar();
  const suspend = host?.suspendAvatar;
  const obscured = host?.hasInteraction ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [speaker, setSpeaker] = useState<number | null>(null);
  const cast = actors.slice(0, 2);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => (visible ? suspend?.() : undefined), [visible, suspend]);
  const active = speaker === null ? null : cast[speaker];
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-testid="avatar-scene"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        maxWidth: '100%',
        gap: 8,
        visibility: obscured ? 'hidden' : 'visible',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'end', gap: 16 }}>
        {cast.map((actor, index) => (
          <button
            key={`${actor.character}-${index}`}
            type="button"
            aria-label={actor.label}
            aria-pressed={speaker === index}
            onClick={() => setSpeaker(speaker === index ? null : index)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: 2,
              border: 0,
              borderRadius: 6,
              color: 'inherit',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{ height: 54, display: 'flex', alignItems: 'end' }}>
              <CharacterFigure
                character={actor.character}
                clip={
                  speaker === index ? 'happy' : active ? 'thinking' : 'idle'
                }
                playing={visible && !obscured}
                assetBase={assetBase}
              />
            </span>
            <span style={{ fontSize: 12 }}>{actor.label}</span>
          </button>
        ))}
      </div>
      {active && (
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: 0,
            maxWidth: 340,
            padding: '8px 10px',
            border: '1px solid var(--color-border-soft, #d8d0c3)',
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.5,
            overflowWrap: 'anywhere',
            background: 'var(--color-bg-warm-white, #fffdf8)',
          }}
        >
          {active.message}
        </p>
      )}
    </div>
  );
}

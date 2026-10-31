'use client';
import { AvatarScene, type AvatarActor } from '@agentrepo/avatar';
import { contentAvatarCast, type ContentCast } from '../lib/avatar-cast';
import { useT } from '../lib/i18n/use-t';
export function AvatarContentScene({
  kind,
  slug = '',
  characters,
}: {
  kind: 'skill' | 'agent' | 'blog';
  slug?: string;
  characters?: ContentCast;
}) {
  const t = useT();
  const cast = characters ?? contentAvatarCast(kind, slug);
  function actor(character: (typeof cast)[number]): AvatarActor {
    return {
      character,
      label: t(`characters.${character}.label`),
      message: t(`characters.${character}.message`),
    };
  }
  const actors =
    cast.length === 2
      ? ([actor(cast[0]), actor(cast[1])] as const)
      : ([actor(cast[0])] as const);
  return (
    <div className="my-4">
      <AvatarScene
        key={`${kind}:${slug}:${cast.join(':')}`}
        actors={actors}
        label={t('characters.label')}
      />
    </div>
  );
}

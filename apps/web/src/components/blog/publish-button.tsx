'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@agentrepo/ui';
import { publishReviewedPost } from '../../app/blog/review/actions';

export function PublishBlogButton({
  id,
  locale,
}: {
  id: string;
  locale: 'es' | 'en';
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  return (
    <div>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setFailed(false);
            const result = await publishReviewedPost(id);
            if (result?.error) setFailed(true);
            else router.refresh();
          })
        }
      >
        {pending
          ? locale === 'es'
            ? 'Publicando…'
            : 'Publishing…'
          : locale === 'es'
            ? 'Publicar artículo'
            : 'Publish article'}
      </Button>
      {failed && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {locale === 'es'
            ? 'No se ha podido publicar. Comprueba tu sesión y vuelve a intentarlo.'
            : 'Could not publish. Check your session and try again.'}
        </p>
      )}
    </div>
  );
}

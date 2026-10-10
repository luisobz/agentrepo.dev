'use client';

import { useT } from '../../../lib/i18n/use-t';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@agentrepo/ui';
import { trpc } from '../../../components/utils/trpc';

interface Proposal {
  id: string;
  title: string;
  authorName?: string | null;
}

function ReviewSection({
  title,
  items,
  total,
  loading,
  onApprove,
  href,
}: {
  title: string;
  items: Proposal[];
  total: number;
  loading: boolean;
  onApprove: (id: string) => Promise<unknown>;
  href: string;
}) {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const approve = async (item: Proposal) => {
    if (!window.confirm(`${t('review.confirm')} ${item.title}`)) return;
    setBusy(item.id);
    setError(false);
    try {
      await onApprove(item.id);
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="rounded-xl border border-[var(--color-border-soft)] p-5">
      <h2 className="mb-4 text-lg font-semibold">
        {title}{' '}
        <span className="text-[var(--color-text-muted)]">({total})</span>
      </h2>
      {error && <p role="alert">{t('review.error')}</p>}
      {loading ? (
        <p role="status">{t('review.loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('review.empty')}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border-soft)]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t('review.author')}:{' '}
                  {item.authorName || t('review.contributor')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href={`${href}/${item.id}`}>{t('review.edit')}</Link>
                </Button>
                <Button
                  disabled={busy !== null}
                  onClick={() => void approve(item)}
                >
                  {busy === item.id
                    ? t('review.publishing')
                    : t('review.approve')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {total > items.length && (
        <Link href={href} className="mt-4 inline-block text-sm underline">
          {t('review.all')}
        </Link>
      )}
    </section>
  );
}

export default function ReviewPage() {
  const t = useT();
  const utils = trpc.useUtils();
  const query = { page: 1, pageSize: 20, pendingReviewOnly: true };
  const skills = trpc.skills.admin.list.useQuery(query);
  const agents = trpc.agents.admin.list.useQuery(query);
  const blog = trpc.blogPosts.admin.list.useQuery(query);
  const approveSkill = trpc.skills.admin.update.useMutation({
    onSuccess: () => utils.skills.invalidate(),
  });
  const approveAgent = trpc.agents.admin.update.useMutation({
    onSuccess: () => utils.agents.invalidate(),
  });
  const approveBlog = trpc.blogPosts.admin.update.useMutation({
    onSuccess: () => utils.blogPosts.invalidate(),
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t('review.heading')}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {t('review.info')}
        </p>
      </header>
      {(skills.error || agents.error || blog.error) && (
        <p role="alert">{t('review.loadError')}</p>
      )}
      <ReviewSection
        title="Skills"
        href="/admin/skills"
        items={skills.data?.items ?? []}
        total={skills.data?.total ?? 0}
        loading={skills.isLoading}
        onApprove={(id) =>
          approveSkill.mutateAsync({ id, data: { isPublished: true } })
        }
      />
      <ReviewSection
        title="Agents"
        href="/admin/agents"
        items={agents.data?.items ?? []}
        total={agents.data?.total ?? 0}
        loading={agents.isLoading}
        onApprove={(id) =>
          approveAgent.mutateAsync({ id, data: { isPublished: true } })
        }
      />
      <ReviewSection
        title="Blog"
        href="/admin/blog"
        items={blog.data?.items ?? []}
        total={blog.data?.total ?? 0}
        loading={blog.isLoading}
        onApprove={(id) =>
          approveBlog.mutateAsync({ id, data: { isPublished: true } })
        }
      />
    </div>
  );
}

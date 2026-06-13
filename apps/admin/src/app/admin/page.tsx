'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@agentrepo/ui';
import Link from 'next/link';
import { trpc } from '../../components/utils/trpc';
import { useT } from '../../lib/i18n/use-t';

const COUNT_INPUT = { page: 1, pageSize: 1 };

function StatCard({
  title,
  description,
  href,
  total,
}: {
  title: string;
  description: string;
  href: string;
  total: number | undefined;
}) {
  return (
    <Link href={href}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold text-[var(--color-brand-garnet)]">
            {total ?? '–'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const t = useT();
  const skills = trpc.skills.admin.list.useQuery(COUNT_INPUT);
  const agents = trpc.agents.admin.list.useQuery(COUNT_INPUT);
  const posts = trpc.blogPosts.admin.list.useQuery(COUNT_INPUT);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('dashboard.subtitle')}
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title={t('nav.skills')}
          description={t('dashboard.skills.desc')}
          href="/admin/skills"
          total={skills.data?.total}
        />
        <StatCard
          title={t('nav.agents')}
          description={t('dashboard.agents.desc')}
          href="/admin/agents"
          total={agents.data?.total}
        />
        <StatCard
          title={t('nav.blog')}
          description={t('dashboard.blog.desc')}
          href="/admin/blog"
          total={posts.data?.total}
        />
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@agentrepo/ui';
import Link from 'next/link';
import { trpc } from '../../components/utils/trpc';

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
  const skills = trpc.skills.admin.list.useQuery(COUNT_INPUT);
  const agents = trpc.agents.admin.list.useQuery(COUNT_INPUT);
  const posts = trpc.blogPosts.admin.list.useQuery(COUNT_INPUT);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage the content published on agentrepo.dev
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Skills"
          description="Reusable prompts, configs and templates"
          href="/admin/skills"
          total={skills.data?.total}
        />
        <StatCard
          title="Agents"
          description="Agent definitions with file trees"
          href="/admin/agents"
          total={agents.data?.total}
        />
        <StatCard
          title="Blog posts"
          description="Articles and changelog entries"
          href="/admin/blog"
          total={posts.data?.total}
        />
      </div>
    </div>
  );
}

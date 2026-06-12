'use client';

import { Button, Input } from '@agentrepo/ui';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PaginationControls } from '../../../components/admin/pagination-controls';
import { PublishedBadge } from '../../../components/admin/published-badge';
import { ResourceTable } from '../../../components/admin/resource-table';
import { trpc } from '../../../components/utils/trpc';

const PAGE_SIZE = 10;

export default function AgentsPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const agents = trpc.agents.admin.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const deleteAgent = trpc.agents.admin.delete.useMutation({
    onSettled: async () => {
      setDeletingId(null);
      await utils.agents.invalidate();
    },
  });

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agents</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Agent definitions with versioned file trees
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/agents/new">New agent</Link>
        </Button>
      </header>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <Input
          placeholder="Search agents…"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <ResourceTable
        isLoading={agents.isLoading}
        emptyMessage="No agents found."
        rows={agents.data?.items ?? []}
        deletingId={deletingId}
        editHref={(agent) => `/admin/agents/${agent.id}`}
        onDelete={(agent) => {
          if (window.confirm(`Delete agent “${agent.title}”?`)) {
            setDeletingId(agent.id);
            deleteAgent.mutate({ id: agent.id });
          }
        }}
        columns={[
          { header: 'Title', render: (agent) => agent.title },
          {
            header: 'Slug',
            render: (agent) => (
              <span className="font-mono text-xs">{agent.slug}</span>
            ),
          },
          {
            header: 'Version',
            render: (agent) => (
              <span className="font-mono text-xs">v{agent.version}</span>
            ),
          },
          {
            header: 'Status',
            render: (agent) => <PublishedBadge isPublished={agent.isPublished} />,
          },
          {
            header: 'Updated',
            render: (agent) => agent.updatedAt.toLocaleDateString(),
          },
        ]}
      />

      {agents.data && (
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={agents.data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

'use client';

import { Button, Input, TypeChip } from '@agentrepo/ui';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PaginationControls } from '../../../components/admin/pagination-controls';
import { PublishedBadge } from '../../../components/admin/published-badge';
import { ResourceTable } from '../../../components/admin/resource-table';
import { trpc } from '../../../components/utils/trpc';

const PAGE_SIZE = 10;

export default function SkillsPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const skills = trpc.skills.admin.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const deleteSkill = trpc.skills.admin.delete.useMutation({
    onSettled: async () => {
      setDeletingId(null);
      await utils.skills.invalidate();
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
          <h1 className="text-2xl font-semibold">Skills</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Prompts, system instructions, configs and templates
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/skills/new">New skill</Link>
        </Button>
      </header>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <Input
          placeholder="Search skills…"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <ResourceTable
        isLoading={skills.isLoading}
        emptyMessage="No skills found."
        rows={skills.data?.items ?? []}
        deletingId={deletingId}
        editHref={(skill) => `/admin/skills/${skill.id}`}
        onDelete={(skill) => {
          if (window.confirm(`Delete skill “${skill.title}”?`)) {
            setDeletingId(skill.id);
            deleteSkill.mutate({ id: skill.id });
          }
        }}
        columns={[
          { header: 'Title', render: (skill) => skill.title },
          {
            header: 'Slug',
            render: (skill) => (
              <span className="font-mono text-xs">{skill.slug}</span>
            ),
          },
          { header: 'Type', render: (skill) => <TypeChip type={skill.type} /> },
          {
            header: 'Status',
            render: (skill) => <PublishedBadge isPublished={skill.isPublished} />,
          },
          {
            header: 'Updated',
            render: (skill) => skill.updatedAt.toLocaleDateString(),
          },
        ]}
      />

      {skills.data && (
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={skills.data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

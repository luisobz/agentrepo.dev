'use client';

import { Button, Input } from '@agentrepo/ui';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PaginationControls } from '../../../components/admin/pagination-controls';
import { PublishedBadge } from '../../../components/admin/published-badge';
import { ResourceTable } from '../../../components/admin/resource-table';
import { trpc } from '../../../components/utils/trpc';

const PAGE_SIZE = 10;

export default function BlogPostsPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const posts = trpc.blogPosts.admin.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const deletePost = trpc.blogPosts.admin.delete.useMutation({
    onSettled: async () => {
      setDeletingId(null);
      await utils.blogPosts.invalidate();
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
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Articles and changelog entries
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">New post</Link>
        </Button>
      </header>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <Input
          placeholder="Search posts…"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <ResourceTable
        isLoading={posts.isLoading}
        emptyMessage="No blog posts found."
        rows={posts.data?.items ?? []}
        deletingId={deletingId}
        editHref={(post) => `/admin/blog/${post.id}`}
        onDelete={(post) => {
          if (window.confirm(`Delete post “${post.title}”?`)) {
            setDeletingId(post.id);
            deletePost.mutate({ id: post.id });
          }
        }}
        columns={[
          { header: 'Title', render: (post) => post.title },
          {
            header: 'Slug',
            render: (post) => (
              <span className="font-mono text-xs">{post.slug}</span>
            ),
          },
          {
            header: 'Status',
            render: (post) => <PublishedBadge isPublished={post.isPublished} />,
          },
          {
            header: 'Updated',
            render: (post) => post.updatedAt.toLocaleDateString(),
          },
        ]}
      />

      {posts.data && (
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={posts.data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

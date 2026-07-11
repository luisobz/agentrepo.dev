'use client';

import { Button, Input } from '@agentrepo/ui';
import { FormEvent, useState } from 'react';
import { PaginationControls } from '../../../components/admin/pagination-controls';
import { trpc } from '../../../components/utils/trpc';

const PAGE_SIZE = 20;

function defaultExpiry(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export default function PlaygroundTokensPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState('');
  const [maxUses, setMaxUses] = useState(5);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [lastCreatedToken, setLastCreatedToken] = useState<string | null>(null);

  const tokens = trpc.playground.admin.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  const createToken = trpc.playground.admin.create.useMutation({
    onSuccess: async (created) => {
      setLastCreatedToken(created.token);
      setLabel('');
      await utils.playground.admin.list.invalidate();
    },
  });

  const setActive = trpc.playground.admin.setActive.useMutation({
    onSettled: () => utils.playground.admin.list.invalidate(),
  });

  const deleteToken = trpc.playground.admin.delete.useMutation({
    onSettled: () => utils.playground.admin.list.invalidate(),
  });

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) {
      return;
    }
    createToken.mutate({
      label: label.trim(),
      maxUses,
      expiresAt: new Date(`${expiresAt}T23:59:59`),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Playground tokens</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Access tokens that gate the real AI flow in the public playground
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium">
          Label
          <Input
            placeholder="Ej: Feria de Empleo 2026"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-56"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Max uses
          <Input
            type="number"
            min={1}
            max={100}
            value={maxUses}
            onChange={(event) => setMaxUses(Number(event.target.value))}
            className="w-24"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Expires
          <Input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className="w-40"
          />
        </label>
        <Button type="submit" disabled={createToken.isPending}>
          {createToken.isPending ? 'Generating…' : 'Generate token'}
        </Button>
      </form>

      {lastCreatedToken ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          Token generated —{' '}
          <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs">
            {lastCreatedToken}
          </code>{' '}
          Copy it now and share it with the visitor.
        </p>
      ) : null}

      {tokens.isLoading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>
      ) : (tokens.data?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No tokens yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-surface)] text-xs uppercase text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tokens.data?.items.map((token) => {
                const expired = token.expiresAt < new Date();
                const exhausted = token.usesCount >= token.maxUses;
                return (
                  <tr
                    key={token.id}
                    className="border-t border-[var(--color-border)]"
                  >
                    <td className="px-4 py-3 font-medium">{token.label}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {token.token}
                    </td>
                    <td className="px-4 py-3">
                      {token.usesCount}/{token.maxUses}
                    </td>
                    <td className="px-4 py-3">
                      {token.expiresAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          !token.isActive
                            ? 'bg-zinc-500/15 text-zinc-500'
                            : expired || exhausted
                              ? 'bg-red-500/15 text-red-600'
                              : 'bg-emerald-500/15 text-emerald-600'
                        }`}
                      >
                        {!token.isActive
                          ? 'Disabled'
                          : expired
                            ? 'Expired'
                            : exhausted
                              ? 'Exhausted'
                              : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setActive.mutate({
                              id: token.id,
                              isActive: !token.isActive,
                            })
                          }
                        >
                          {token.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:border-red-400"
                          onClick={() => {
                            if (
                              window.confirm(`Delete token “${token.label}”?`)
                            ) {
                              deleteToken.mutate({ id: token.id });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tokens.data && (
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={tokens.data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

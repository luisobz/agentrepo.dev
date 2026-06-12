'use client';

import { Button } from '@agentrepo/ui';
import Link from 'next/link';
import React from 'react';

export interface ResourceColumn<TRow> {
  header: string;
  render: (row: TRow) => React.ReactNode;
  className?: string;
}

interface ResourceTableProps<TRow extends { id: string }> {
  columns: ResourceColumn<TRow>[];
  rows: TRow[];
  isLoading: boolean;
  emptyMessage: string;
  editHref: (row: TRow) => string;
  onDelete: (row: TRow) => void;
  deletingId: string | null;
}

export function ResourceTable<TRow extends { id: string }>({
  columns,
  rows,
  isLoading,
  emptyMessage,
  editHref,
  onDelete,
  deletingId,
}: ResourceTableProps<TRow>) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
            {columns.map((column) => (
              <th
                key={column.header}
                className={`px-4 py-3 font-medium text-[var(--color-text-secondary)] ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-[var(--color-text-muted)]"
              >
                Loading…
              </td>
            </tr>
          )}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-[var(--color-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--color-border-soft)] last:border-b-0 hover:bg-[var(--color-bg-surface)]"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-4 py-3 ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={editHref(row)}>Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--color-brand-garnet)]"
                      disabled={deletingId === row.id}
                      onClick={() => onDelete(row)}
                    >
                      {deletingId === row.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

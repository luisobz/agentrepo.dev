'use client';

import type { ContactRequestStatus } from '@agentrepo/trpc/schemas';
import { CONTACT_REQUEST_STATUSES } from '@agentrepo/trpc/schemas';
import { useState } from 'react';
import { PaginationControls } from '../../../components/admin/pagination-controls';
import { trpc } from '../../../components/utils/trpc';

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<ContactRequestStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600',
  PROCESSING: 'bg-sky-500/15 text-sky-600',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600',
  FAILED: 'bg-red-500/15 text-red-600',
};

function StatusBadge({ status }: { status: ContactRequestStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ContactRequestStatus | ''>('');

  const contacts = trpc.contact.admin.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    status: status || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Portfolio contact requests processed by the AI agent
          </p>
        </div>
        <select
          aria-label="Filter by status"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as ContactRequestStatus | '');
          }}
        >
          <option value="">All statuses</option>
          {CONTACT_REQUEST_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </header>

      {contacts.isLoading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>
      ) : (contacts.data?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No contact requests found.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {contacts.data?.items.map((request) => (
            <li
              key={request.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{request.email}</span>
                  <span className="rounded bg-[var(--color-brand-garnet-ghost)] px-2 py-0.5 text-xs text-[var(--color-brand-garnet)]">
                    {request.subject}
                  </span>
                  <StatusBadge status={request.status} />
                </div>
                <time className="text-xs text-[var(--color-text-secondary)]">
                  {request.createdAt.toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
                {request.message}
              </p>
            </li>
          ))}
        </ul>
      )}

      {contacts.data && (
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={contacts.data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

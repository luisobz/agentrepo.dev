'use client';

import { useParams } from 'next/navigation';
import { AgentForm } from '../../../../components/admin/agents/agent-form';
import { FormError } from '../../../../components/admin/form/form-error';
import { trpc } from '../../../../components/utils/trpc';

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>();
  const agent = trpc.agents.admin.byId.useQuery({ id });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit agent</h1>
      {agent.isLoading && (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      )}
      {agent.error && <FormError message={agent.error.message} />}
      {agent.data && <AgentForm agent={agent.data} />}
    </div>
  );
}

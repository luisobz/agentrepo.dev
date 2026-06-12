import { AgentForm } from '../../../../components/admin/agents/agent-form';

export default function NewAgentPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New agent</h1>
      <AgentForm />
    </div>
  );
}

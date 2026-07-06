import type { Metadata } from 'next';
import { PlaygroundBoard } from '../../components/playground/playground-board';

export const metadata: Metadata = {
  title: 'Playground | AgentRepo.dev',
  description:
    'Interactive Kanban playground where autonomous AI sub-agents plan, code, test and deploy features live.',
};

export default function PlaygroundPage() {
  return (
    <div className="-mt-24 min-h-screen bg-[#14110f] pt-28 text-[#fdf8ef]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(122,34,48,0.25),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c4909a]">
            Agent Playground
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Una pizarra Kanban donde los agentes trabajan en directo
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8d8273]">
            Arrastra una tarea y observa cómo los subagentes programan, testean
            (y se equivocan, y se corrigen) hasta desplegarla. Con un token de
            acceso puedes pedirles una feature real generada con IA en
            streaming.
          </p>
        </header>
        <PlaygroundBoard />
      </div>
    </div>
  );
}

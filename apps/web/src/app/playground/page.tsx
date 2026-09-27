import type { Metadata } from 'next';
import { getServerT } from '../../lib/i18n/server';
import { PlaygroundBoard } from '../../components/playground/playground-board';

export const metadata: Metadata = {
  title: 'Playground | AgentRepo.dev',
  description:
    'Interactive Kanban simulation where AI sub-agents code, test, document and release features in batches.',
};

export default async function PlaygroundPage() {
  const t = await getServerT();
  return (
    <div className="-mt-24 min-h-screen bg-[#14110f] pt-28 text-[#fdf8ef]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(122,34,48,0.25),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c4909a]">
            {t('playground.eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('playground.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8d8273]">
            {t('playground.subtitle')}
          </p>
        </header>
        <PlaygroundBoard />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { getServerT } from '../../lib/i18n/server';
import { CodeBlock } from '../../components/cli/code-block';

export const metadata: Metadata = {
  title: 'CLI | AgentRepo.dev',
  description:
    'Install pinned skill snapshots with pnpm and agent.json. Choose your tool, verify integrity and reproduce installations.',
};
const RELEASE =
  'https://github.com/luisobz/agentrepo.dev/releases/tag/cli-v0.3.0';
const PACKAGE =
  'https://github.com/luisobz/agentrepo.dev/releases/download/cli-v0.3.0/agentrepo-cli-0.3.0.tgz';
const MANIFEST = JSON.stringify(
  {
    schemaVersion: 1,
    target: 'claude',
    locale: 'en',
    skills: { 'code-review': '1.0.0', 'project-planning': '2.1.0' },
  },
  null,
  2,
);
const TOOLS = [
  ['agents', '.agents/skills'],
  ['codex', '.agents/skills'],
  ['claude', '.claude/skills'],
  ['cursor', '.cursor/skills'],
  ['copilot', '.github/skills'],
];

export default async function CliPage() {
  const t = await getServerT();
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-20 sm:px-6">
      <header className="mb-10 mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-garnet)]">
          AgentRepo CLI · 0.3.0
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {t('cli.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {t('cli.intro')}
        </p>
      </header>
      <div className="space-y-10">
        <section className="min-w-0 space-y-4" aria-labelledby="cli-install">
          <h2 id="cli-install" className="text-2xl font-semibold">
            {t('cli.install')}
          </h2>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.installInfo')}
          </p>
          <CodeBlock label={t('cli.install')} code={`pnpm add -g ${PACKAGE}`} />
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.launchInfo')}
          </p>
          <CodeBlock label="Terminal" code="agentrepo" />
          <a
            href={RELEASE}
            className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--color-brand-garnet)] underline underline-offset-4"
          >
            {t('cli.release')} ↗
          </a>
        </section>
        <section className="min-w-0 space-y-4" aria-labelledby="cli-manifest">
          <h2 id="cli-manifest" className="text-2xl font-semibold">
            {t('cli.manifest')}
          </h2>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.manifestInfo')}
          </p>
          <CodeBlock label="agent.json" code={MANIFEST} />
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.fields')}
          </p>
        </section>
        <section className="min-w-0 space-y-4" aria-labelledby="cli-run">
          <h2 id="cli-run" className="text-2xl font-semibold">
            {t('cli.run')}
          </h2>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.runInfo')}
          </p>
          <CodeBlock
            label="Commands"
            code={[
              'agentrepo skill2',
              'agentrepo verify',
              'agentrepo install',
              'agentrepo reset --hard',
            ].join('\n')}
          />
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border-soft)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-bg-surface)]">
                <tr>
                  <th className="px-4 py-3">{t('cli.target')}</th>
                  <th className="px-4 py-3">{t('cli.folder')}</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map(([target, folder]) => (
                  <tr
                    key={target}
                    className="border-t border-[var(--color-border-soft)]"
                  >
                    <td className="px-4 py-3">
                      <code>{target}</code>
                      {target === 'agents' && (
                        <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                          {t('cli.fallback')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{folder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="min-w-0 space-y-4" aria-labelledby="cli-lock">
          <h2 id="cli-lock" className="text-2xl font-semibold">
            {t('cli.lock')}
          </h2>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.lockInfo')}
          </p>
          <CodeBlock label=".gitignore" code=".agentrepo/" />
        </section>
        <section
          className="space-y-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-5 sm:p-8"
          aria-labelledby="cli-snapshots"
        >
          <h2 id="cli-snapshots" className="text-2xl font-semibold">
            {t('cli.snapshots')}
          </h2>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {t('cli.snapshotInfo')}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
            {t('cli.limits')}
          </p>
        </section>
        <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>{t('cli.scope')}</p>
          <a
            className="mt-4 inline-flex min-h-10 items-center font-medium text-[var(--color-brand-garnet)] underline underline-offset-4"
            href="https://github.com/luisobz/agentrepo.dev/blob/main/packages/cli/README.md"
          >
            {t('cli.docs')} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function SkillNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 text-center sm:px-6">
      <p className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Skill not found
      </h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">
        The skill you are looking for does not exist or is not published.
      </p>
      <Link
        href="/skills"
        className="mt-6 inline-block font-medium text-[var(--color-brand-garnet)] underline-offset-4 hover:underline"
      >
        ← Back to skills
      </Link>
    </div>
  );
}

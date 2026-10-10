import Link from 'next/link';
import type { Metadata } from 'next';
import { CreatorForm } from '../../components/creator/creator-form';
import { getAuthenticatedUser } from '../../lib/supabase/server';

export const metadata: Metadata = {
  title: 'Creator | AgentRepo.dev',
  description: 'Submit a skill or agent to AgentRepo.dev.',
};

export default async function CreatorPage() {
  const user = await getAuthenticatedUser();
  const metadataName = user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  const authorName = typeof metadataName === 'string' && metadataName.trim()
    ? metadataName.trim()
    : user?.email?.split('@')[0] ?? '';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <header className="mb-8 mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-brand-garnet)]">Creator Studio</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Share a skill or agent</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
          Upload Markdown, review the details and send a draft. Your account is recorded as the author; an editor reviews it before publication.
        </p>
      </header>
      {user ? (
        <CreatorForm authorName={authorName} />
      ) : (
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="text-xl font-semibold">Sign in to create</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Your submissions will appear under your author name after review.</p>
          <Link href="/auth/login?next=/creator" className="mt-5 inline-flex rounded-full bg-[var(--color-brand-garnet)] px-5 py-2.5 text-sm font-semibold text-white">
            Sign in or create an account
          </Link>
        </div>
      )}
    </div>
  );
}

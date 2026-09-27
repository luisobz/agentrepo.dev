'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

type AssetKind = 'skill' | 'agent';

function toSlug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}

export function CreatorForm({ authorName }: { authorName: string }) {
  const [kind, setKind] = useState<AssetKind>('skill');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [skillType, setSkillType] = useState<'prompt' | 'system' | 'config' | 'template'>('prompt');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleTitle = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(toSlug(value));
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 100_000) {
      setError('The Markdown file must be smaller than 100 KB.');
      return;
    }
    setContent(await file.text());
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = kind === 'skill'
      ? { kind, title, slug, description, content, type: skillType }
      : { kind, title, slug, shortDescription: description, readmeContent: content };
    try {
      const response = await fetch('/api/creator/submit', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body: { error?: string } = await response.json();
        setError(body.error ?? 'Could not save your draft.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900">
      <h2 className="text-xl font-semibold">Draft submitted</h2>
      <p className="mt-2 text-sm">Your {kind} is saved with {authorName} as author. It will appear publicly after editorial review.</p>
      <button type="button" onClick={() => { setSubmitted(false); setTitle(''); setSlug(''); setDescription(''); setContent(''); setSlugEdited(false); }} className="mt-4 text-sm font-semibold underline">Create another</button>
    </div>;
  }

  const inputClass = 'w-full rounded-xl border border-[var(--color-border-medium)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)]';
  return <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <fieldset className="flex gap-2"><legend className="sr-only">Content type</legend>
        {(['skill', 'agent'] as const).map((option) => <label key={option} className="cursor-pointer rounded-full border border-[var(--color-border-medium)] px-4 py-2 text-sm">
          <input type="radio" name="kind" value={option} checked={kind === option} onChange={() => setKind(option)} className="mr-2" />{option === 'skill' ? 'Skill' : 'Agent'}
        </label>)}
      </fieldset>
      <p className="text-xs text-[var(--color-text-muted)]">Author: <strong>{authorName}</strong></p>
    </div>
    <label className="block text-sm font-medium">Title
      <input className={`${inputClass} mt-1`} value={title} onChange={(event) => handleTitle(event.target.value)} required maxLength={200} />
    </label>
    <label className="block text-sm font-medium">URL slug
      <input className={`${inputClass} mt-1 font-mono`} value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
    </label>
    <label className="block text-sm font-medium">{kind === 'skill' ? 'Description' : 'Short description'}
      <input className={`${inputClass} mt-1`} value={description} onChange={(event) => setDescription(event.target.value)} required={kind === 'agent'} maxLength={kind === 'agent' ? 300 : 500} />
    </label>
    {kind === 'skill' ? <label className="block text-sm font-medium">Skill type
      <select className={`${inputClass} mt-1`} value={skillType} onChange={(event) => setSkillType(event.target.value as typeof skillType)}>
        <option value="prompt">Prompt</option><option value="system">System</option><option value="config">Config</option><option value="template">Template</option>
      </select>
    </label> : null}
    <label className="block text-sm font-medium">{kind === 'skill' ? 'Markdown content' : 'Agent README'}
      <textarea className={`${inputClass} mt-1 min-h-64 font-mono`} value={content} onChange={(event) => setContent(event.target.value)} required maxLength={100_000} />
    </label>
    <label className="block text-sm font-medium">Or upload a Markdown file (.md or .txt)
      <input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={handleFile} className="mt-2 block w-full text-sm" />
    </label>
    <p className="text-xs text-[var(--color-text-muted)]">Submitted content stays unpublished until reviewed. One Markdown file can be uploaded per draft.</p>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-brand-garnet)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
      {busy ? 'Saving…' : 'Submit draft for review'}
    </button>
  </form>;
}

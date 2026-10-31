'use client';

import {
  useLocale,
  RelatedLinksEditor,
  type ContentRelatedLink,
} from '@agentrepo/ui';
import { useT } from '../../lib/i18n/use-t';

import {
  useState,
  useRef,
  useMemo,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  type AgentSourceFile,
  validateAgentFiles,
  InvalidAgentFilesError,
} from '@agentrepo/trpc/schemas';
import { readAgentUpload } from './read-agent-upload';

type AssetKind = 'skill' | 'agent' | 'blog';

function toSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export function CreatorForm({
  authorName,
  initialKind = 'skill',
}: {
  authorName: string;
  initialKind?: AssetKind;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [sourceLocale, setSourceLocale] = useState<'en' | 'es'>(locale);
  const [relatedLinks, setRelatedLinks] = useState<ContentRelatedLink[]>([]);
  const [kind, setKind] = useState<AssetKind>(initialKind);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [content, setContent] = useState('');
  const [skillType, setSkillType] = useState<
    'prompt' | 'system' | 'config' | 'template'
  >('prompt');
  const [files, setFiles] = useState<AgentSourceFile[]>([]);
  const [reading, setReading] = useState(false);
  const uploadSequence = useRef(0);
  const uploadBytes = useMemo(
    () =>
      files.reduce(
        (total, file) => total + new TextEncoder().encode(file.content).length,
        0,
      ),
    [files],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleTitle = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(toSlug(value));
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selection = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selection.length) return;
    const sequence = ++uploadSequence.current;
    setReading(true);
    setError(null);
    try {
      if (kind === 'agent') {
        const imported = await readAgentUpload(selection);
        if (sequence !== uploadSequence.current) return;
        setFiles(imported);
        const readme = imported.find(
          (file) => file.path.toLowerCase() === 'readme.md',
        );
        if (readme) setContent(readme.content);
      } else {
        const file = selection[0];
        if (
          selection.length !== 1 ||
          !/\.(md|txt)$/i.test(file.name) ||
          file.size > 100_000
        )
          throw new InvalidAgentFilesError(t('creator.fileSize'));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(
          await file.arrayBuffer(),
        );
        if (validateAgentFiles([{ path: 'content.md', content: text }]))
          throw new InvalidAgentFilesError(t('creator.fileSize'));
        if (sequence !== uploadSequence.current) return;
        setContent(text);
      }
    } catch (error) {
      if (sequence === uploadSequence.current)
        setError(
          error instanceof Error ? error.message : t('creator.saveFailed'),
        );
    } finally {
      if (sequence === uploadSequence.current) setReading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload =
      kind === 'skill'
        ? { kind, title, slug, description, content, type: skillType }
        : kind === 'blog'
          ? { kind, title, slug, excerpt: description, content }
          : {
              kind,
              title,
              slug,
              shortDescription: description,
              readmeContent: content,
              files,
              repositoryUrl: repositoryUrl || null,
            };
    try {
      const response = await fetch('/api/creator/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, relatedLinks, sourceLocale }),
      });
      if (!response.ok) {
        const body: { error?: string } = await response.json();
        setError(body.error ?? t('creator.saveFailed'));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t('creator.network'));
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900"
      >
        <h2 className="text-xl font-semibold">{t('creator.submitted')}</h2>
        <p className="mt-2 text-sm">{t('creator.successInfo')}</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setRelatedLinks([]);
            setTitle('');
            setSlug('');
            setDescription('');
            setContent('');
            setFiles([]);
            setRepositoryUrl('');
            setSlugEdited(false);
          }}
          className="mt-4 text-sm font-semibold underline"
        >
          {t('creator.another')}
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border-medium)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)]';
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset disabled={busy} className="flex flex-wrap gap-2">
          <legend className="sr-only">Content type</legend>
          {(['skill', 'agent', 'blog'] as const).map((option) => (
            <label
              key={option}
              className="cursor-pointer rounded-full border border-[var(--color-border-medium)] px-4 py-2 text-sm"
            >
              <input
                type="radio"
                name="kind"
                value={option}
                checked={kind === option}
                onChange={() => {
                  uploadSequence.current++;
                  setKind(option);
                  setFiles([]);
                  setReading(false);
                  setError(null);
                }}
                className="mr-2"
              />
              {option === 'skill'
                ? 'Skill'
                : option === 'agent'
                  ? 'Agent'
                  : 'Blog'}
            </label>
          ))}
        </fieldset>
        <p className="text-xs text-[var(--color-text-muted)]">
          {t('creator.author')}: <strong>{authorName}</strong>
        </p>
      </div>
      <label className="block text-sm font-medium">
        {locale === 'es' ? 'Idioma del contenido' : 'Content language'}
        <select
          value={sourceLocale}
          onChange={(event) =>
            setSourceLocale(event.target.value === 'es' ? 'es' : 'en')
          }
          className="mt-2 block w-full rounded-lg border bg-transparent p-3"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
      <RelatedLinksEditor
        value={relatedLinks}
        onChange={setRelatedLinks}
        disabled={busy}
      />
      <label className="block text-sm font-medium">
        {t('creator.title')}
        <input
          className={`${inputClass} mt-1`}
          value={title}
          onChange={(event) => handleTitle(event.target.value)}
          required
          maxLength={200}
        />
      </label>
      <label className="block text-sm font-medium">
        {t('creator.slug')}
        <input
          className={`${inputClass} mt-1 font-mono`}
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(true);
          }}
          required
          maxLength={120}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </label>
      <label className="block text-sm font-medium">
        {kind === 'blog' ? t('creator.summary') : t('creator.description')}
        <input
          className={`${inputClass} mt-1`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required={kind === 'agent'}
          maxLength={kind === 'agent' ? 300 : 500}
        />
      </label>
      {kind === 'agent' ? (
        <label className="block text-sm font-medium">
          {t('creator.repo')}
          <input
            type="url"
            className={`${inputClass} mt-1`}
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
            placeholder="https://github.com/owner/project"
            maxLength={500}
          />
          <span className="mt-2 block text-xs text-[var(--color-text-muted)]">
            {t('creator.agentHelp')}
          </span>
        </label>
      ) : null}
      {kind === 'skill' ? (
        <label className="block text-sm font-medium">
          {t('creator.skillType')}
          <select
            className={`${inputClass} mt-1`}
            value={skillType}
            onChange={(event) =>
              setSkillType(event.target.value as typeof skillType)
            }
          >
            <option value="prompt">Prompt</option>
            <option value="system">System</option>
            <option value="config">Config</option>
            <option value="template">Template</option>
          </select>
        </label>
      ) : null}
      <label className="block text-sm font-medium">
        {kind === 'agent'
          ? t('creator.documentation')
          : kind === 'blog'
            ? t('creator.article')
            : t('creator.skillContent')}
        <textarea
          className={`${inputClass} mt-1 min-h-64 font-mono`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          maxLength={100_000}
        />
      </label>
      <label className="block text-sm font-medium">
        {kind === 'agent' ? t('creator.uploadAgent') : t('creator.upload')}
        <input
          type="file"
          accept={
            kind === 'agent' ? undefined : '.md,.txt,text/markdown,text/plain'
          }
          multiple={kind === 'agent'}
          disabled={reading || busy}
          onChange={handleFile}
          className="mt-2 block w-full text-sm"
        />
      </label>
      {kind === 'agent' && (
        <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
          <p>{t('creator.packageHelp')}</p>
          {reading && <p role="status">{t('creator.readingFiles')}</p>}
          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span>
                  {files.length} {t('creator.files')} ·{' '}
                  {Math.ceil(uploadBytes / 1000)} KB
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="underline"
                >
                  {t('creator.clearFiles')}
                </button>
              </div>
              <ul
                aria-label={t('creator.packageFiles')}
                className="max-h-40 overflow-y-auto rounded-lg border border-[var(--color-border-soft)] p-3 font-mono"
              >
                {files.map((file) => (
                  <li key={file.path} className="break-all">
                    {file.path}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-[var(--color-text-muted)]">
        {t('creator.pendingHelp')}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-6 text-[var(--color-text-muted)]">
        {t('creator.contributionTerms')}{' '}
        <a className="underline" href="/terms">
          {t('footer.terms')}
        </a>{' '}
        ·{' '}
        <a className="underline" href="/privacy">
          {t('footer.privacy')}
        </a>
      </p>
      <button
        type="submit"
        disabled={busy || reading}
        className="rounded-full bg-[var(--color-brand-garnet)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? t('creator.saving') : t('creator.submit')}
      </button>
    </form>
  );
}

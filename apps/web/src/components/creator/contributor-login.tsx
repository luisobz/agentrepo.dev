'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@agentrepo/ui';
import { type FormEvent, useState, useEffect } from 'react';
import { useT } from '../../lib/i18n/use-t';
import {
  contributionHref,
  type ContributionKind,
} from '../../lib/contribution';
import { safeReturnPath } from '../../lib/auth/return-path';
import { isSupabaseConfigured } from '../../lib/supabase/config';

function returnPath(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return safeReturnPath(next);
}

export function ContributorLogin({
  contributionType,
}: {
  contributionType?: ContributionKind;
}) {
  const t = useT();
  const configured = isSupabaseConfigured();
  const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === 'true';
  const [ready, setReady] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setReady(true);
    if (new URLSearchParams(window.location.search).get('error') === 'oauth') {
      setError(t('creator.oauthError'));
    }
  }, [t]);

  const signInWithGitHub = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        contributionType
          ? `/auth/github?type=${contributionType}`
          : '/auth/github',
        { method: 'POST' },
      );
      const data: { url?: string } = await response.json();
      if (!response.ok || !data.url) {
        setError(t('creator.oauthError'));
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError(t('creator.network'));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const response = await fetch(
        mode === 'signup' ? '/auth/signup' : '/auth/signin',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...(mode === 'signup' ? { contributionType } : {}),
          }),
        },
      );
      if (!response.ok) {
        const body: { error?: string } = await response.json();
        setError(body.error ?? t('creator.authFailed'));
        return;
      }
      if (mode === 'signup') {
        setMessage(t('creator.registered'));
      } else {
        const destination = new URL(
          contributionType ? contributionHref(contributionType) : returnPath(),
          window.location.origin,
        );
        if (destination.origin === window.location.origin) {
          window.location.assign(destination.href);
        } else {
          window.location.assign('/creator');
        }
      }
    } catch {
      setError(t('creator.network'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-lg hover:translate-y-0">
      <CardHeader>
        <CardTitle>{t('creator.access')}</CardTitle>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('creator.accessInfo')}
        </p>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={!ready || !configured || !githubEnabled || busy}
          onClick={signInWithGitHub}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 16 16"
            className="h-5 w-5 shrink-0"
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          {t('creator.github')}
        </Button>
        {error ? (
          <p role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : null}
        {!githubEnabled && (
          <p
            role="status"
            className="mb-3 text-xs text-[var(--color-text-muted)]"
          >
            {t('creator.githubPending')}
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowEmail(!showEmail)}
          disabled={!ready || busy}
          aria-expanded={showEmail}
          aria-controls="contributor-email"
          className="mt-4 text-sm underline underline-offset-4 disabled:opacity-50"
        >
          {showEmail ? t('creator.hideEmail') : t('creator.useEmail')}
        </button>
        {showEmail && (
          <div id="contributor-email" className="mt-5">
            <div
              className="mb-5 flex gap-2"
              role="tablist"
              aria-label="Authentication mode"
            >
              <button
                type="button"
                role="tab"
                disabled={!ready || busy}
                aria-selected={mode === 'signin'}
                onClick={() => {
                  setMode('signin');
                  setMessage(null);
                  setError(null);
                }}
                className="rounded-full border px-3 py-1.5 text-sm"
              >
                {t('creator.signin')}
              </button>
              <button
                type="button"
                role="tab"
                disabled={!ready || busy}
                aria-selected={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setMessage(null);
                  setError(null);
                }}
                className="rounded-full border px-3 py-1.5 text-sm"
              >
                {t('creator.signup')}
              </button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <label className="text-sm">
                {t('creator.email')}
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <label className="text-sm">
                {t('creator.password')}
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={mode === 'signup' ? 10 : 1}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                />
              </label>
              {mode === 'signup' ? (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t('creator.passwordHelp')}
                </p>
              ) : null}
              {!configured ? (
                <p role="alert" className="text-xs text-red-700">
                  {t('creator.unavailable')}
                </p>
              ) : null}
              {message ? (
                <p role="status" className="text-xs text-emerald-700">
                  {message}
                </p>
              ) : null}
              <Button type="submit" disabled={!configured || busy}>
                {busy
                  ? t('creator.wait')
                  : mode === 'signin'
                    ? t('creator.signin')
                    : t('creator.signup')}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

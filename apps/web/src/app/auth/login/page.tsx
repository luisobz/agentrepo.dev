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
import { useT } from '../../../lib/i18n/use-t';
import { safeReturnPath } from '../../../lib/auth/return-path';
import { isSupabaseConfigured } from '../../../lib/supabase/config';

function returnPath(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return safeReturnPath(next);
}

export default function LoginPage() {
  const t = useT();
  const configured = isSupabaseConfigured();
  const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === 'true';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'oauth') {
      setError(t('creator.oauthError'));
    }
  }, [t]);

  const signInWithGitHub = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/auth/github', { method: 'POST' });
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
          body: JSON.stringify({ email, password }),
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
        window.location.assign(returnPath());
      }
    } catch {
      setError(t('creator.network'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-24">
      <Card className="w-full max-w-sm hover:translate-y-0">
        <CardHeader>
          <CardTitle>
            {mode === 'signin' ? t('creator.signin') : t('creator.signup')}
          </CardTitle>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('creator.intro')}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="mb-5 w-full"
            disabled={!configured || !githubEnabled || busy}
            onClick={signInWithGitHub}
          >
            {busy ? t('creator.connecting') : t('creator.github')}
          </Button>
          {!githubEnabled && (
            <p
              role="status"
              className="mb-3 text-xs text-[var(--color-text-muted)]"
            >
              {t('creator.githubPending')}
            </p>
          )}
          <p className="mb-5 text-xs text-[var(--color-text-muted)]">
            {t('creator.authInfo')}
          </p>
          <div
            className="mb-5 flex gap-2"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              disabled={busy}
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
              disabled={busy}
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
            {error ? (
              <p role="alert" className="text-xs text-red-700">
                {error}
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
        </CardContent>
      </Card>
    </div>
  );
}

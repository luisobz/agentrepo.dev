'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@agentrepo/ui';
import { FormEvent, useState } from 'react';
import { useT } from '../../../lib/i18n/use-t';
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from '../../../lib/supabase/client';

type SocialProvider = 'github' | 'google' | 'apple';

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="currentColor" d="M21.35 11.1H12v2.96h5.35c-.5 2.36-2.47 3.94-5.35 3.94a5.99 5.99 0 1 1 0-11.98c1.53 0 2.9.55 3.98 1.45l2.18-2.18A8.93 8.93 0 0 0 12 3a9 9 0 1 0 0 18c5.19 0 8.63-3.65 8.63-8.79 0-.39-.04-.75-.1-1.11Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="currentColor" d="M16.36 12.94c-.03-2.32 1.9-3.43 1.98-3.49-1.08-1.58-2.76-1.8-3.35-1.82-1.43-.15-2.79.84-3.51.84-.72 0-1.84-.82-3.02-.8-1.55.02-2.99.9-3.79 2.29-1.62 2.8-.41 6.94 1.16 9.21.77 1.11 1.69 2.36 2.89 2.31 1.16-.05 1.6-.75 3-.75s1.8.75 3.02.73c1.25-.02 2.04-1.13 2.8-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.44-3.67Zm-2.29-6.74c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.29Z" />
    </svg>
  );
}

export default function LoginPage() {
  const t = useT();
  const configured = isSupabaseConfigured();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithProvider = async (provider: SocialProvider) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(t('auth.notConfigured'));
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signInWithEmail = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(t('auth.notConfigured'));
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else {
      window.location.assign('/');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-24">
      <Card className="w-full max-w-sm hover:translate-y-0">
        <CardHeader>
          <CardTitle>{t('auth.title')}</CardTitle>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('auth.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => signInWithProvider('github')}>
            <span className="mr-2"><GithubIcon /></span> {t('auth.continueGithub')}
          </Button>
          <Button variant="secondary" onClick={() => signInWithProvider('google')}>
            <span className="mr-2"><GoogleIcon /></span> {t('auth.continueGoogle')}
          </Button>
          <Button variant="secondary" onClick={() => signInWithProvider('apple')}>
            <span className="mr-2"><AppleIcon /></span> {t('auth.continueApple')}
          </Button>

          {!configured && (
            <p className="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
              {t('auth.notConfigured')}
            </p>
          )}

          {error && (
            <p role="alert" className="text-xs text-[var(--color-brand-garnet)]">
              {error}
            </p>
          )}

          {/* Classic email login stays tucked away behind a secondary link */}
          {showEmailForm ? (
            <form onSubmit={signInWithEmail} className="mt-2 flex flex-col gap-3 border-t border-[var(--color-border-soft)] pt-4">
              <Input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Input
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button type="submit">{t('auth.signIn')}</Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="mt-1 text-center text-xs text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-text-primary)] hover:underline"
            >
              {t('auth.emailToggle')}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

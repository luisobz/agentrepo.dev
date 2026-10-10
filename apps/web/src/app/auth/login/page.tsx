'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@agentrepo/ui';
import { type FormEvent, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase/config';

function returnPath(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next?.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const response = await fetch(mode === 'signup' ? '/auth/signup' : '/auth/signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body: { error?: string } = await response.json();
        setError(body.error ?? 'Authentication failed.');
        return;
      }
      if (mode === 'signup') {
        setMessage('Account created. Check your email to confirm it, then sign in.');
      } else {
        window.location.assign(returnPath());
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="flex min-h-[70vh] items-center justify-center px-4 pb-24">
    <Card className="w-full max-w-sm hover:translate-y-0">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'Sign in' : 'Create account'}</CardTitle>
        <p className="text-sm text-[var(--color-text-secondary)]">Sign in to submit skills and agents under your name.</p>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex gap-2" role="tablist" aria-label="Authentication mode">
          <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setError(null); }} className="rounded-full border px-3 py-1.5 text-sm">Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setError(null); }} className="rounded-full border px-3 py-1.5 text-sm">Create account</button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-sm">Email<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label className="text-sm">Password<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={mode === 'signup' ? 10 : 1} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>
          {mode === 'signup' ? <p className="text-xs text-[var(--color-text-muted)]">Use at least 10 characters. Email confirmation is required.</p> : null}
          {!configured ? <p role="alert" className="text-xs text-red-700">Authentication is not configured.</p> : null}
          {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
          {message ? <p role="status" className="text-xs text-emerald-700">{message}</p> : null}
          <Button type="submit" disabled={!configured || busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>
      </CardContent>
    </Card>
  </div>;
}

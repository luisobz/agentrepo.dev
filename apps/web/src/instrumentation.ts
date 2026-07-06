import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
const isEnabled = process.env.NODE_ENV === 'production' && !!dsn;

export function register() {
  if (!isEnabled) {
    return;
  }
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export const onRequestError = Sentry.captureRequestError;

import * as Sentry from '@sentry/nestjs';

// Must run before Nest is bootstrapped so Sentry can hook the runtime.
const dsn = process.env.SENTRY_DSN;

if (process.env.NODE_ENV === 'production' && dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

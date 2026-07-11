import { describe, it, expect } from 'vitest';
import { envSchema } from './backend';

// A cryptographically-strong-looking 32+ char secret for production cases.
const STRONG_A = 'a'.repeat(16) + 'B'.repeat(16) + 'c9'; // 34 chars
const STRONG_B = 'z'.repeat(16) + 'Y'.repeat(16) + 'k7'; // 34 chars

const DB_URL = 'postgresql://ci:ci@localhost:5432/ci?schema=public';

/**
 * Helper: parse an env object built from only the keys provided, so that Zod's
 * defaults (and the superRefine production guards) are exercised faithfully.
 */
function parse(input: Record<string, string>) {
  return envSchema.safeParse(input);
}

function issuePaths(result: ReturnType<typeof envSchema.safeParse>): string[][] {
  if (result.success) return [];
  return result.error.issues.map((i) => i.path as string[]);
}

describe('envSchema — defaults & required fields', () => {
  it('accepts a minimal valid input and applies defaults', () => {
    const result = parse({ DATABASE_URL: DB_URL });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.DATABASE_URL).toBe(DB_URL);
    expect(result.data.PORT).toBe(3001);
    expect(result.data.NODE_ENV).toBe('development');
    expect(result.data.INTERNAL_COMMUNICATION_API_SECRET).toBe('dev-internal-secret');
    expect(result.data.AUTH_SECRET).toBe('dev-auth-secret-change-me');
  });

  it('fails when DATABASE_URL is missing', () => {
    const result = parse({});

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContainEqual(['DATABASE_URL']);
  });
});

describe('envSchema — production secret guards', () => {
  it('fails in production when AUTH_SECRET is the dev default', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'production',
      AUTH_SECRET: 'dev-auth-secret-change-me',
      INTERNAL_COMMUNICATION_API_SECRET: STRONG_B,
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContainEqual(['AUTH_SECRET']);
  });

  it('fails in production when AUTH_SECRET is shorter than 32 chars', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'production',
      AUTH_SECRET: 'short-secret',
      INTERNAL_COMMUNICATION_API_SECRET: STRONG_B,
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContainEqual(['AUTH_SECRET']);
  });

  it('fails in production when INTERNAL_COMMUNICATION_API_SECRET is the dev default', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'production',
      AUTH_SECRET: STRONG_A,
      INTERNAL_COMMUNICATION_API_SECRET: 'dev-internal-secret',
    });

    expect(result.success).toBe(false);
    const paths = issuePaths(result);
    expect(paths).toContainEqual(['INTERNAL_COMMUNICATION_API_SECRET']);
    // AUTH_SECRET is strong, so it must be the ONLY failing field.
    expect(paths).not.toContainEqual(['AUTH_SECRET']);
  });

  it('fails in production when INTERNAL_COMMUNICATION_API_SECRET is shorter than 32 chars', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'production',
      AUTH_SECRET: STRONG_A,
      INTERNAL_COMMUNICATION_API_SECRET: 'short',
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContainEqual(['INTERNAL_COMMUNICATION_API_SECRET']);
  });

  it('succeeds in production when both secrets are strong 32+ char values', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'production',
      AUTH_SECRET: STRONG_A,
      INTERNAL_COMMUNICATION_API_SECRET: STRONG_B,
    });

    expect(result.success).toBe(true);
    expect(issuePaths(result)).toEqual([]);
  });

  it('does NOT fire the production guards in development with weak/default secrets', () => {
    const result = parse({
      DATABASE_URL: DB_URL,
      NODE_ENV: 'development',
      AUTH_SECRET: 'dev-auth-secret-change-me',
      INTERNAL_COMMUNICATION_API_SECRET: 'dev-internal-secret',
    });

    expect(result.success).toBe(true);
  });
});

/**
 * PII masking for Langfuse traces. The contact workflow traces the visitor's
 * email/subject/message through LangChain, which Langfuse would otherwise
 * export verbatim to its cloud. This redacts email addresses from any span
 * input/output before it leaves the process.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(EMAIL_RE, '[redacted-email]');
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        redact(val),
      ])
    );
  }
  return value;
}

/** Langfuse `mask` hook: strips PII from span data before export. */
export function maskSensitiveData({ data }: { data: unknown }): unknown {
  return redact(data);
}

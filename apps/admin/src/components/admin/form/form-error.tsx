export function FormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <p
      role="alert"
      className="rounded-md border border-[var(--color-brand-garnet-muted)] bg-[var(--color-brand-garnet-ghost)] px-4 py-3 text-sm text-[var(--color-brand-garnet-deep)]"
    >
      {message}
    </p>
  );
}

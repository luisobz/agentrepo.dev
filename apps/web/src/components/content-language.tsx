import { getServerLocale } from '../lib/i18n/server';

export async function ContentLanguage({
  contentLocale,
}: {
  contentLocale: string;
}) {
  const requested = await getServerLocale();
  if (requested === contentLocale) return null;
  return (
    <p
      role="status"
      className="mb-6 rounded-lg border border-[var(--color-border-soft)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {requested === 'es'
        ? 'Este contenido todavía no está disponible en español. Se muestra el original en inglés.'
        : 'This content is not available in English yet. Showing the Spanish original.'}
    </p>
  );
}

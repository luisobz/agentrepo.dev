import { InstallerError } from './errors.mjs';
import { record } from './manifest.mjs';
export async function fetchPublishedSkill(registry, slug, version) {
  const url = new URL(`${registry}/api/trpc/skills.byVersion`);
  url.searchParams.set('input', JSON.stringify({ json: { slug, version } }));
  let response;
  try {
    response = await fetch(url, {
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
      headers: {
        accept: 'application/json',
        'user-agent': 'AgentRepo-CLI/0.1.0',
      },
    });
  } catch {
    throw new InstallerError(
      `No se pudo conectar al catálogo para ${slug}@${version}.`,
    );
  }
  if (!response.ok)
    throw new InstallerError(
      `${slug}@${version}: el catálogo respondió HTTP ${response.status}. Comprueba que la versión esté publicada.`,
    );
  let text = '';
  let size = 0;
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > 8 * 1024 * 1024)
      throw new InstallerError(`${slug}: respuesta demasiado grande.`);
    text += decoder.decode(chunk, { stream: true });
  }
  text += decoder.decode();
  let envelope;
  try {
    envelope = JSON.parse(text);
  } catch {
    throw new InstallerError(`${slug}: respuesta JSON inválida.`);
  }
  const payload = (Array.isArray(envelope) ? envelope[0] : envelope)?.result
    ?.data?.json;
  if (!record(payload))
    throw new InstallerError(`${slug}: respuesta del catálogo inválida.`);
  return payload;
}

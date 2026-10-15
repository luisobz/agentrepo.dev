export class RequestBodyError extends Error {
  constructor(
    readonly status: 400 | 413,
    message: string,
  ) {
    super(message);
    this.name = 'RequestBodyError';
  }
}

/** Bound the actual UTF-8 request stream before concatenation or JSON parsing. */
export async function readLimitedJson(
  request: Request,
  limit = 3_000_000,
): Promise<unknown> {
  const encoding = request.headers.get('content-encoding');
  if (encoding && encoding.toLowerCase() !== 'identity')
    throw new RequestBodyError(
      400,
      'Compressed request bodies are not accepted',
    );
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit))
    throw new RequestBodyError(413, 'Submission too large');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError(400, 'Invalid JSON');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit)
        throw new RequestBodyError(413, 'Submission too large');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(body),
    ) as unknown;
  } catch {
    throw new RequestBodyError(400, 'Invalid JSON');
  }
}

import { BlobReader, ZipReader } from '@zip.js/zip.js';
import {
  AGENT_FILE_LIMITS,
  InvalidAgentFilesError,
  validateAgentFiles,
  validateAgentPath,
  type AgentSourceFile,
} from '@agentrepo/trpc/schemas';

function fail(message: string): never {
  throw new InvalidAgentFilesError(message);
}
function decode(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return fail('Only UTF-8 text source files are supported');
  }
}
function check(files: AgentSourceFile[]): AgentSourceFile[] {
  const problem = validateAgentFiles(files);
  if (problem) fail(problem);
  return files;
}

export async function readAgentZip(blob: Blob): Promise<AgentSourceFile[]> {
  if (blob.size > AGENT_FILE_LIMITS.archiveBytes) fail('ZIP exceeds 4 MB');
  const reader = new ZipReader(new BlobReader(blob), {
    useWebWorkers: false,
    strictness: 'strict',
    checkSignature: true,
    checkOverlappingEntry: true,
  });
  const files: AgentSourceFile[] = [];
  let entries = 0,
    total = 0;
  try {
    for await (const entry of reader.getEntriesGenerator()) {
      if (++entries > AGENT_FILE_LIMITS.files * 2)
        fail('Too many archive entries');
      if (
        entry.encrypted ||
        ('symbolicLink' in entry && entry.symbolicLink) ||
        (entry.unixMode &&
          ![0, 0o100000, 0o040000].includes(entry.unixMode & 0o170000))
      )
        fail('Encrypted archives and special files are not supported');
      if (entry.directory) {
        const problem = validateAgentPath(
          entry.filename.replace(/\/$/, '') + '/directory.md',
        );
        if (problem) fail(problem);
        continue;
      }
      const problem = validateAgentPath(entry.filename);
      if (problem) fail(problem);
      if (
        entry.uncompressedSize > AGENT_FILE_LIMITS.fileBytes ||
        total + entry.uncompressedSize > AGENT_FILE_LIMITS.totalBytes ||
        files.length >= AGENT_FILE_LIMITS.files
      )
        fail('ZIP source package exceeds the size limit');
      const chunks: Uint8Array[] = [];
      let size = 0;
      await entry.getData(
        new WritableStream<Uint8Array>({
          write(chunk) {
            size += chunk.byteLength;
            total += chunk.byteLength;
            if (
              size > AGENT_FILE_LIMITS.fileBytes ||
              total > AGENT_FILE_LIMITS.totalBytes
            )
              fail('Expanded ZIP exceeds the size limit');
            chunks.push(chunk);
          },
        }),
        { signal: AbortSignal.timeout(10_000), checkSignature: true },
      );
      if (size !== entry.uncompressedSize)
        fail('ZIP entry size does not match its metadata');
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      files.push({ path: entry.filename, content: decode(bytes) });
    }
  } finally {
    await reader.close();
  }
  if (!files.length) fail('The ZIP contains no source files');
  // A conventional enclosing project folder is removed once, preserving its subtree.
  const prefix = files[0].path.split('/')[0] + '/';
  if (files.every((file) => file.path.startsWith(prefix)))
    for (const file of files) file.path = file.path.slice(prefix.length);
  return check(files);
}

export async function readAgentFiles(
  selection: File[],
): Promise<AgentSourceFile[]> {
  if (selection.length === 1 && /\.zip$/i.test(selection[0].name))
    return readAgentZip(selection[0]);
  if (selection.some((file) => /\.zip$/i.test(file.name)))
    fail('Choose one ZIP or multiple source files');
  if (!selection.length || selection.length > AGENT_FILE_LIMITS.files)
    fail('Choose between 1 and 200 source files');
  let total = 0;
  const files: AgentSourceFile[] = [];
  for (const file of selection) {
    total += file.size;
    if (
      file.size > AGENT_FILE_LIMITS.fileBytes ||
      total > AGENT_FILE_LIMITS.totalBytes
    )
      fail('Source package exceeds the size limit');
    files.push({
      path: file.webkitRelativePath || file.name,
      content: decode(new Uint8Array(await file.arrayBuffer())),
    });
  }
  return check(files);
}

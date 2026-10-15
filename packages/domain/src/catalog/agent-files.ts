import { DomainError } from '../errors/domain.error';
import type { FileTree, FileTreeNode } from './file-tree';

export const AGENT_FILE_LIMITS = {
  files: 200,
  depth: 8,
  fileBytes: 100_000,
  totalBytes: 1_000_000,
  archiveBytes: 4_000_000,
} as const;
export interface AgentSourceFile {
  path: string;
  content: string;
}
export class InvalidAgentFilesError extends DomainError {
  readonly code = 'INVALID_AGENT_FILES';
  constructor(detail: string) {
    super(detail);
  }
}
const extensions = new Set(
  'md markdown mdx txt json yaml yml toml ini conf cfg py sh bash zsh fish js mjs cjs ts tsx jsx html css scss sql xml csv rst service timer socket target sudoers properties'.split(
    ' ',
  ),
);
const namedFiles = new Set([
  'license',
  'notice',
  'dockerfile',
  'makefile',
  'version',
  'sha256sums',
  'sudoers',
  '.gitignore',
  '.dockerignore',
  '.env.example',
  '.env.sample',
  '.env.template',
]);
const blockedDirs = new Set([
  '.git',
  '.ssh',
  '.aws',
  '.secrets',
  'node_modules',
  '__pycache__',
  '__macosx',
  '.next',
]);
const reserved = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const encoder = new TextEncoder();

export function validateAgentPath(path: string): string | null {
  if (path.length > 512 || path !== path.normalize('NFC'))
    return 'Invalid or non-normalized file path';
  const parts = path.split('/');
  if (parts.length > AGENT_FILE_LIMITS.depth) return 'File path is too deep';
  for (const part of parts) {
    if (
      !part ||
      part.length > 120 ||
      part === '.' ||
      part === '..' ||
      /[. ]$/.test(part) ||
      !/^[\p{L}\p{N}_.@()+ -]+$/u.test(part) ||
      reserved.test(part) ||
      ['__proto__', 'prototype', 'constructor'].includes(part.toLowerCase())
    )
      return 'Unsafe file path';
  }
  if (
    parts
      .slice(0, -1)
      .some(
        (part) =>
          blockedDirs.has(part.toLowerCase()) ||
          part.toLowerCase().startsWith('.env.'),
      )
  )
    return 'Generated or private directories are not accepted';
  const name = parts.at(-1)?.toLowerCase() ?? '';
  if (
    [
      'id_rsa',
      'id_ed25519',
      'id_ecdsa',
      'credentials',
      'authorized_keys',
    ].includes(name)
  )
    return 'Private credential files are not accepted';
  if (
    !namedFiles.has(name) &&
    name.includes('.') &&
    (!extensions.has(name.split('.').at(-1) ?? '') || name.startsWith('.env'))
  )
    return 'Unsupported file type; upload text source files';
  return null;
}

export function validateAgentFiles(
  files: readonly AgentSourceFile[],
): string | null {
  if (files.length > AGENT_FILE_LIMITS.files) return 'Too many files';
  const paths = new Map<string, 'file' | 'directory'>();
  const directoryNames = new Map<string, string>();
  let total = 0;
  for (const file of files) {
    const problem = validateAgentPath(file.path);
    if (problem) return problem;
    const parts = file.path.toLowerCase().split('/');
    for (let i = 1; i < parts.length; i++) {
      const dir = parts.slice(0, i).join('/');
      if (paths.get(dir) === 'file') return 'File and directory paths collide';
      const actual = file.path.split('/').slice(0, i).join('/');
      if (directoryNames.has(dir) && directoryNames.get(dir) !== actual)
        return 'Directory casing is ambiguous';
      directoryNames.set(dir, actual);
      paths.set(dir, 'directory');
    }
    const key = parts.join('/');
    if (paths.has(key)) return 'Duplicate or colliding file path';
    paths.set(key, 'file');
    if (
      Array.from(file.content).some((character) => {
        const code = character.charCodeAt(0);
        return code === 127 || (code < 32 && ![9, 10, 13].includes(code));
      })
    )
      return 'Binary or control-character content is not accepted';
    const bytes = encoder.encode(file.content).length;
    total += bytes;
    if (
      bytes > AGENT_FILE_LIMITS.fileBytes ||
      total > AGENT_FILE_LIMITS.totalBytes
    )
      return 'Source package exceeds the size limit';
  }
  return null;
}

export function withAgentReadme(
  files: readonly AgentSourceFile[],
  readme: string,
): AgentSourceFile[] {
  return [
    { path: 'README.md', content: readme },
    ...files.filter((file) => file.path.toLowerCase() !== 'readme.md'),
  ];
}

export function buildAgentFileTree(
  files: readonly AgentSourceFile[],
  readme: string,
): FileTree {
  const originalProblem = validateAgentFiles(files);
  if (originalProblem) throw new InvalidAgentFilesError(originalProblem);
  const source = withAgentReadme(files, readme);
  const problem = validateAgentFiles(source);
  if (problem) throw new InvalidAgentFilesError(problem);
  const tree: FileTree = [];
  for (const file of source) {
    const parts = file.path.split('/');
    let siblings = tree;
    for (const part of parts.slice(0, -1)) {
      let directory = siblings.find(
        (node): node is Extract<FileTreeNode, { type: 'directory' }> =>
          node.type === 'directory' && node.name === part,
      );
      if (!directory) {
        directory = { name: part, type: 'directory', children: [] };
        siblings.push(directory);
      }
      siblings = directory.children;
    }
    siblings.push({
      name: parts.at(-1) ?? file.path,
      type: 'file',
      content: file.content,
    });
  }
  return tree;
}

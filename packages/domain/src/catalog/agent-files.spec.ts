import { describe, expect, it } from 'vitest';
import {
  buildAgentFileTree,
  validateAgentFiles,
  AGENT_FILE_LIMITS,
} from './agent-files';

describe('agent source packages', () => {
  it('preserves source directories and uses the reviewed README', () => {
    expect(
      buildAgentFileTree(
        [
          { path: 'src/main.py', content: 'print(1)' },
          { path: 'readme.md', content: 'old' },
        ],
        '# Reviewed',
      ),
    ).toEqual([
      { name: 'README.md', type: 'file', content: '# Reviewed' },
      {
        name: 'src',
        type: 'directory',
        children: [{ name: 'main.py', type: 'file', content: 'print(1)' }],
      },
    ]);
  });
  it.each([
    '../x.py',
    '/x.py',
    'a\\x.py',
    'C:/x.py',
    'a/../x.py',
    'a//x.py',
    '__proto__/x.py',
    '.git/config',
    '.env',
    'private.key',
    'nested.zip',
    'nul.txt',
    'a/x.py.',
  ])('rejects unsafe or unsupported path %s', (path) => {
    expect(validateAgentFiles([{ path, content: 'data' }])).not.toBeNull();
  });
  it('rejects duplicate names, file-directory collisions, binary content and excessive depth', () => {
    for (const files of [
      [
        { path: 'A.py', content: '' },
        { path: 'a.py', content: '' },
      ],
      [
        { path: 'src.py', content: '' },
        { path: 'src.py/main.py', content: '' },
      ],
      [{ path: 'main.py', content: '\0binary' }],
      [
        { path: 'Src/a.py', content: '' },
        { path: 'src/b.py', content: '' },
      ],
      [{ path: 'a/'.repeat(9) + 'main.py', content: '' }],
    ])
      expect(validateAgentFiles(files)).not.toBeNull();
  });
  it('bounds file count and UTF-8 bytes rather than just character count', () => {
    expect(
      validateAgentFiles(
        Array.from({ length: AGENT_FILE_LIMITS.files + 1 }, (_, i) => ({
          path: `file${i}.md`,
          content: '',
        })),
      ),
    ).not.toBeNull();
    expect(
      validateAgentFiles([
        { path: 'unicode.md', content: '😀'.repeat(30_000) },
      ]),
    ).not.toBeNull();
    expect(
      validateAgentFiles([
        { path: 'script.sh', content: '#!/bin/sh\necho hello' },
        { path: '.env.example', content: 'TOKEN=' },
      ]),
    ).toBeNull();
  });
});

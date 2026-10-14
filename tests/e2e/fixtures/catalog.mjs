import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const projectGuide = readFileSync(
  new URL('../../../content/agents/01-NANOBOT.md', import.meta.url),
  'utf8',
);

// Read-only catalogue fixture. Auth and mutations are deliberately unavailable.
const relatedLinks = [
  {
    kind: 'github',
    label: 'Project source',
    url: 'https://github.com/example/project',
  },
  { kind: 'x', label: 'Creator on X', url: 'https://x.com/example' },
  {
    kind: 'documentation',
    label: 'Documentation',
    url: 'https://example.com/docs',
  },
];
const shared = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'linked-project',
  title: 'Linked project',
  relatedLinks,
  isPublished: true,
  createdAt: new Date('2026-10-10T12:00:00Z'),
  updatedAt: new Date('2026-10-10T12:00:00Z'),
  headerImageUrl: null,
  isPremium: false,
  isLocked: false,
  priceCents: null,
  currency: 'EUR',
  previewContent: null,
  version: '1.0.0',
};
function read(path) {
  if (path.endsWith('.versions')) return [];
  if (path === 'agents.catalog')
    return {
      items: [
        {
          ...shared,
          shortDescription: 'An editorial project guide',
          hasPlayground: true,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 100,
    };
  if (path === 'agents.bySlug')
    return {
      ...shared,
      shortDescription: 'An editorial project guide',
      repositoryUrl: relatedLinks[0].url,
      fileTree: [
        { name: 'README.md', type: 'file', content: '# Project guide' },
      ],
      readmeContent:
        '# Project guide\n\nDocumentation comes before the file browser.\n\n' +
        projectGuide,
    };
  if (path === 'skills.bySlug')
    return {
      ...shared,
      type: 'prompt',
      description: 'A linked skill',
      content:
        '---\nname: linked-project\ndescription: Skill metadata\n---\n\n# Linked skill\n\nUse **clear language**.\n\n---\n\nKeep this separator.',
    };
  if (path === 'blog.getPostBySlug')
    return {
      ...shared,
      excerpt: 'A linked article',
      content: '# Linked article',
    };
  return { items: [], total: 0, page: 1, pageSize: 6 };
}
createServer((request, response) => {
  if (request.method !== 'GET') {
    response.writeHead(405).end();
    return;
  }
  const paths = new URL(request.url, 'http://localhost').pathname
    .split('/')
    .at(-1)
    .split(',');
  const results = paths.map((path) => ({
    result: {
      data: {
        json: read(path),
        ...(path === 'agents.catalog'
          ? {
              meta: {
                values: {
                  'items.0.createdAt': ['Date'],
                  'items.0.updatedAt': ['Date'],
                },
                v: 1,
              },
            }
          : {}),
        ...(path.endsWith('bySlug') || path.endsWith('getPostBySlug')
          ? {
              meta: {
                values: { createdAt: ['Date'], updatedAt: ['Date'] },
                v: 1,
              },
            }
          : {}),
      },
    },
  }));
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(results));
}).listen(4000, '127.0.0.1');

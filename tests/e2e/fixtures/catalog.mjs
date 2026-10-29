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
  sourceLocale: 'en',
  contentLocale: 'en',
  availableLocales: ['en', 'es'],
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
  if (path === 'skills.byVersion') return read('skills.bySlug');
  if (path === 'agents.byVersion') return read('agents.bySlug');
  if (path === 'skills.versions')
    return ['1.0.0', '0.9.0'].map((version, index) => ({
      id: version,
      version,
      changelog: null,
      createdAt: shared.createdAt,
      downloadsTotal: 0,
      downloadsWeekly: 0,
      isLatest: index === 0,
    }));
  if (path.endsWith('.versions')) return [];
  if (path === 'skills.catalog')
    return { items: [read('skills.bySlug')], total: 1, page: 1, pageSize: 100 };
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
        { name: 'z.py', type: 'file', content: 'print(1)' },
        { name: 'README.md', type: 'file', content: '# Project guide' },
        {
          name: 'src',
          type: 'directory',
          children: [{ name: 'b.py', type: 'file', content: 'print(2)' }],
        },
        { name: 'settings.json', type: 'file', content: '{}' },
        {
          name: 'docs',
          type: 'directory',
          children: [{ name: 'usage.md', type: 'file', content: '# Usage' }],
        },
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
  if (path === 'blog.catalog')
    return {
      items: [read('blog.getPostBySlug')],
      total: 1,
      page: 1,
      pageSize: 100,
    };
  if (path === 'blog.getPostBySlug')
    return {
      ...shared,
      excerpt: 'A linked article',
      content: '# Linked article',
    };
  return { items: [], total: 0, page: 1, pageSize: 6 };
}
function localizedRead(path, locale, slug, version) {
  let value = read(path);
  if (path === 'skills.bySlug' && slug === 'draft-head')
    value = { ...value, slug, content: '# Unreleased draft' };
  if (path === 'agents.bySlug' && slug === 'draft-head')
    value = { ...value, slug, readmeContent: '# Unreleased README' };
  if (path === 'agents.byVersion' && slug === 'draft-head')
    value = { ...value, fileTree: [], readmeContent: null };
  if (path === 'skills.byVersion' && version === '0.9.0')
    value = {
      ...value,
      version,
      content: '# Original release\n\nKeep the original instructions.',
    };
  if (locale !== 'es') return value;
  const translate = (item) => ({
    ...item,
    contentLocale: 'es',
    title: 'Proyecto enlazado',
    ...(item.description ? { description: 'Una skill enlazada' } : {}),
    ...(item.shortDescription
      ? { shortDescription: 'Una guía del proyecto' }
      : {}),
    ...(item.excerpt ? { excerpt: 'Un artículo enlazado' } : {}),
    ...(path.startsWith('skills.') && item.content
      ? {
          content:
            '---\nname: linked-project\ndescription: Metadatos de la skill\n---\n\n# Skill enlazada\n\nUsa **lenguaje claro**.',
        }
      : {}),
    ...(path.startsWith('blog.') && item.content
      ? { content: '# Artículo enlazado' }
      : {}),
    ...(item.readmeContent
      ? { readmeContent: '# Guía del proyecto\n\nDocumentación en español.' }
      : {}),
  });
  return value.items
    ? { ...value, items: value.items.map(translate) }
    : Array.isArray(value)
      ? value
      : translate(value);
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
  const input = JSON.parse(
    new URL(request.url, 'http://localhost').searchParams.get('input') ?? '{}',
  );
  const results = paths.map((path, index) => {
    const args = input[index]?.json ?? input.json ?? {};
    if (
      path === 'skills.byVersion' &&
      (!['1.0.0', '0.9.0'].includes(args.version) ||
        args.slug === 'missing-snapshot')
    )
      return {
        error: {
          json: {
            message: 'Skill version not found',
            code: -32004,
            data: { code: 'NOT_FOUND', httpStatus: 404, path },
          },
        },
      };
    return {
      result: {
        data: {
          json: localizedRead(
            path,
            input[index]?.json?.locale ?? input.json?.locale,
            input[index]?.json?.slug ?? input.json?.slug,
            args.version,
          ),
          ...(path === 'skills.versions'
            ? {
                meta: {
                  values: { '0.createdAt': ['Date'], '1.createdAt': ['Date'] },
                  v: 1,
                },
              }
            : {}),
          ...(['agents.catalog', 'skills.catalog', 'blog.catalog'].includes(
            path,
          )
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
          ...(path.endsWith('bySlug') ||
          path.endsWith('byVersion') ||
          path.endsWith('getPostBySlug')
            ? {
                meta: {
                  values: { createdAt: ['Date'], updatedAt: ['Date'] },
                  v: 1,
                },
              }
            : {}),
        },
      },
    };
  });
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(results));
}).listen(4000, '127.0.0.1');

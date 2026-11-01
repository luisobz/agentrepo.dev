// Run after migrations against an isolated, disposable local PostgreSQL database.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const load = createRequire(resolve('packages/infrastructure/package.json'));
const { PrismaClient } = load('@prisma/client');
const { PrismaPg } = load('@prisma/adapter-pg');
const { PrismaPopularityRepository } = load(
  './dist/src/persistence/prisma/repositories/prisma-popularity.repository.js',
);
const url = new URL(process.env.POPULARITY_TEST_DATABASE_URL);
assert(
  ['127.0.0.1', 'localhost'].includes(url.hostname),
  'Only disposable loopback databases are allowed',
);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url.href }),
});
async function main() {
  const slug = `popularity-test-${Date.now()}`;
  const publicPost = await prisma.blogPost.create({
    data: { slug, title: 'Public test', content: 'Test', isPublished: true },
  });
  const draft = await prisma.blogPost.create({
    data: { slug: `${slug}-draft`, title: 'Draft', content: 'Test' },
  });
  const skill = await prisma.skill.create({
    data: {
      slug: `${slug}-skill`,
      title: 'Skill',
      content: 'Test',
      type: 'prompt',
      isPublished: true,
    },
  });
  const repo = new PrismaPopularityRepository(prisma);
  try {
    await Promise.all(
      Array.from({ length: 5 }, () => repo.recordView('blog', slug)),
    );
    await repo.recordView('blog', `${slug}-draft`);
    await repo.recordView('blog', "' OR true --");
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    const old = new Date(day);
    old.setUTCDate(old.getUTCDate() - 8);
    await prisma.contentViewDay.create({
      data: { kind: 'blog', contentId: publicPost.id, day: old, count: 999 },
    });
    for (const version of ['0.1.0', '0.2.0']) {
      const v = await prisma.skillVersion.create({
        data: { skillId: skill.id, version, content: 'Test' },
      });
      await prisma.skillVersionDownloadDay.create({
        data: { versionId: v.id, day, count: 2 },
      });
    }
    const rows = await repo.recent(day);
    assert.equal(
      rows.find((r) => r.slug === slug).views,
      5,
      'Atomic counts, excluding old activity',
    );
    assert.equal(
      rows.find((r) => r.slug === skill.slug).downloads,
      4,
      'All published releases contribute once',
    );
    assert(!rows.some((r) => r.slug === draft.slug), 'Drafts are never public');
    assert.equal(
      await prisma.contentViewDay.count({ where: { contentId: draft.id } }),
      0,
    );
    const grants =
      await prisma.$queryRaw`SELECT has_table_privilege('anon', '"ContentViewDay"', 'SELECT') AS anon, has_table_privilege('authenticated', '"ContentViewDay"', 'INSERT') AS authenticated, has_table_privilege('agentrepo_prisma', '"ContentViewDay"', 'INSERT') AS backend`;
    assert.deepEqual(grants[0], {
      anon: false,
      authenticated: false,
      backend: true,
    });
    console.log(
      'PASS: concurrent counts, time window, version sums, draft exclusion, parameterization and database grants',
    );
  } finally {
    await prisma.contentViewDay.deleteMany({
      where: { contentId: { in: [publicPost.id, draft.id, skill.id] } },
    });
    await prisma.blogPost.deleteMany({
      where: { id: { in: [publicPost.id, draft.id] } },
    });
    await prisma.skill.delete({ where: { id: skill.id } });
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

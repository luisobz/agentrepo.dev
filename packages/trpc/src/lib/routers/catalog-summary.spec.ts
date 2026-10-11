import { expect, it } from 'vitest';
import { agentSummary, skillSummary, postSummary } from './catalog-summary';
it('catalogue summaries never carry snapshot bodies or file contents', () => {
  const content = 'large/private instructions'.repeat(10000);
  const agent = agentSummary({
    slug: 'example',
    readmeContent: content,
    previewContent: content,
    fileTree: [
      {
        type: 'directory',
        name: 'src',
        children: [{ type: 'file', name: 'Demo.ts', content }],
      },
    ],
  });
  expect(agent).toEqual({ slug: 'example', hasPlayground: true });
  expect(
    skillSummary({ slug: 'example', content, previewContent: content }),
  ).toEqual({ slug: 'example' });
  expect(postSummary({ slug: 'example', content })).toEqual({
    slug: 'example',
  });
  expect(JSON.stringify(agent).length).toBeLessThan(100);
});

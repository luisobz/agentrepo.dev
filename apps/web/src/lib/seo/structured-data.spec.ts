import { expect, it } from 'vitest';
import { homeStructuredData, serializeStructuredData } from './structured-data';

it('identifies the real platform without invented adoption claims', () => {
  const data = homeStructuredData('es');
  expect(data['@graph']).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@type': 'WebApplication',
        url: 'https://agentrepo.dev',
        inLanguage: ['en', 'es'],
      }),
    ]),
  );
  expect(JSON.stringify(data)).not.toMatch(
    /aggregateRating|userInteractionCount/,
  );
});
it('escapes script boundaries while preserving valid JSON', () => {
  const value = { description: '</script><script>alert(1)</script>' };
  const serialized = serializeStructuredData(value);
  expect(serialized).not.toContain('<');
  expect(JSON.parse(serialized)).toEqual(value);
});

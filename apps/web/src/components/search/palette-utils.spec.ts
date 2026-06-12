import { describe, expect, it } from 'vitest';
import {
  flattenGroups,
  groupHits,
  hitHref,
  moveSelection,
  type SearchHit,
} from './palette-utils';

const hit = (type: SearchHit['type'], id: string): SearchHit => ({
  id,
  slug: `slug-${id}`,
  title: id,
  description: '',
  type,
});

describe('hitHref', () => {
  it('builds the public route for each content type', () => {
    expect(hitHref(hit('skill', 'a'))).toBe('/skills/slug-a');
    expect(hitHref(hit('agent', 'b'))).toBe('/agents/slug-b');
    expect(hitHref(hit('blog', 'c'))).toBe('/blog/slug-c');
  });
});

describe('groupHits / flattenGroups', () => {
  it('groups hits by type in a stable order and drops empty groups', () => {
    const groups = groupHits([hit('blog', '1'), hit('skill', '2')]);

    expect(groups.map((group) => group.label)).toEqual(['Skills', 'Blog']);
    expect(flattenGroups(groups).map((entry) => entry.id)).toEqual(['2', '1']);
  });

  it('returns no groups for no hits', () => {
    expect(groupHits([])).toEqual([]);
  });
});

describe('moveSelection', () => {
  it('moves down and up within bounds', () => {
    expect(moveSelection(0, 1, 3)).toBe(1);
    expect(moveSelection(2, -1, 3)).toBe(1);
  });

  it('wraps around both ends', () => {
    expect(moveSelection(2, 1, 3)).toBe(0);
    expect(moveSelection(0, -1, 3)).toBe(2);
  });

  it('stays at zero for empty lists', () => {
    expect(moveSelection(0, 1, 0)).toBe(0);
  });
});

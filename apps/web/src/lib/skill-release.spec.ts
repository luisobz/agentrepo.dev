import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ head: vi.fn(), pinned: vi.fn() }));
vi.mock('./skills', () => ({
  getPublishedSkillBySlug: mocks.head,
  getSkillVersion: mocks.pinned,
}));
import { getPinnedSkillRelease, skillVersionHref } from './skill-release';
beforeEach(() => vi.resetAllMocks());
it('constructs a version-specific share URL', () =>
  expect(skillVersionHref('writer', '1.0.0')).toBe('/skills/writer/1.0.0'));
it('reads the requested snapshot even when the latest version is different', async () => {
  mocks.head.mockResolvedValue({
    slug: 'writer',
    version: '2.0.0',
    content: 'Unreleased draft',
  });
  mocks.pinned.mockResolvedValue({
    version: '1.0.0',
    content: 'Fixed instructions',
  });
  const result = await getPinnedSkillRelease('writer', '1.0.0');
  expect(result?.pinned.content).toBe('Fixed instructions');
  expect(mocks.pinned).toHaveBeenCalledWith('writer', '1.0.0');
});
it('never falls back to the working copy when a snapshot is missing, including latest', async () => {
  mocks.head.mockResolvedValue({
    slug: 'writer',
    version: '1.0.0',
    content: 'Unreleased draft',
  });
  mocks.pinned.mockResolvedValue(null);
  expect(await getPinnedSkillRelease('writer', '1.0.0')).toBeNull();
});
it('rejects a mismatched API snapshot rather than showing another version', async () => {
  mocks.head.mockResolvedValue({ version: '2.0.0' });
  mocks.pinned.mockResolvedValue({
    version: '2.0.0',
    content: 'Wrong version',
  });
  expect(await getPinnedSkillRelease('writer', '1.0.0')).toBeNull();
});
it('rejects invalid versions before calling the API', async () => {
  expect(await getPinnedSkillRelease('writer', 'not-a-version')).toBeNull();
  expect(mocks.pinned).not.toHaveBeenCalled();
});

it('hides snapshots whose parent is no longer public', async () => {
  mocks.head.mockResolvedValue(null);
  mocks.pinned.mockResolvedValue({
    version: '1.0.0',
    content: 'Previously published',
  });
  expect(await getPinnedSkillRelease('writer', '1.0.0')).toBeNull();
});

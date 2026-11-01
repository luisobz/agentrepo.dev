import { expect, it } from 'vitest';
import { contentAvatarCast } from './avatar-cast';
it('assigns the cloud specialist without spending a thematic slot on trending', () => {
  expect(
    contentAvatarCast('blog', 'optimizar-costes-google-cloud-gcp'),
  ).toEqual(['cloud']);
  expect(contentAvatarCast('agent', 'aws-infrastructure')).toEqual(['cloud']);
  expect(contentAvatarCast('blog', 'binance-eip-7702')).toEqual([
    'researcher',
    'guardian',
  ]);
  expect(contentAvatarCast('skill', 'writer')).not.toContain('trending');
});

import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('My New Skill')).toBe('my-new-skill');
  });

  it('strips accents and symbols', () => {
    expect(slugify('Configuración avanzada (v2)!')).toBe('configuracion-avanzada-v2');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Hello World--  ')).toBe('hello-world');
  });

  it('returns an empty string for symbol-only input', () => {
    expect(slugify('***')).toBe('');
  });
});

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should handle undefined, null, and false values', () => {
    expect(cn('bg-red-500', undefined, null, false, 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
  });
});

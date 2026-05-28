import { vi } from 'vitest';

vi.mock('next/font/local', () => ({
  default: () => ({
    className: 'mock-font',
    style: { fontFamily: 'mock' },
  }),
}));
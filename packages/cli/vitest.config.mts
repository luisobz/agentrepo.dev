import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    name: 'cli',
    environment: 'node',
    include: ['packages/cli/tests/**/*.spec.mjs'],
  },
});

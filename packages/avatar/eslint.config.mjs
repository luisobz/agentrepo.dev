import baseConfig from '../../eslint.config.mjs';

export default [
  {
    plugins: { react: (await import('@eslint-react/eslint-plugin')).default },
    rules: { 'react/rules-of-hooks': 'error', 'react/exhaustive-deps': 'warn' },
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    // Empty functions are legitimate stubs in test mocks and setup shims.
    files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}', '**/vitest.setup.mts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];

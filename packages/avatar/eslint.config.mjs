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
];

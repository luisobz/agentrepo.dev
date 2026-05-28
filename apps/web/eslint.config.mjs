import nextEslintPluginNext from '@next/eslint-plugin-next';
import baseConfig from '../../eslint.config.mjs';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  {
    plugins: { react: (await import('@eslint-react/eslint-plugin')).default },
    rules: { 'react/rules-of-hooks': 'error', 'react/exhaustive-deps': 'warn' },
  },
  ...baseConfig,
  {
    ignores: ['.next/**/*'],
  },
];

import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'test/**'], 
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypescript,
    },
    rules: {
      ...eslintPluginTypescript.configs['recommended'].rules,
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
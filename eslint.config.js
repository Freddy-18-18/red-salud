import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import nx from '@nx/eslint-plugin';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/coverage/**',
      '**/target/**',
      '**/.dart_tool/**',
      '**/android/**',
      '**/ios/**',
      '.tauri',
      'out',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
      '@nx': nx,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': [
        'warn',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Enforce dependency boundaries between Nx projects.
      // Apps must not depend on other apps/services directly; communication goes via shared libs.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [
            '^@red-salud/types$',
            '^@red-salud/contracts$',
            '^@red-salud/core$',
            '^@red-salud/design-system$',
            '^@red-salud/identity$',
            '^@red-salud/sdk-.*$',
            '^@red-salud/auth-sdk$',
            '^@red-salud/api-client$',
          ],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
            {
              sourceTag: 'type:service',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
            {
              sourceTag: 'layer:ui',
              onlyDependOnLibsWithTags: ['layer:ui', 'layer:types'],
            },
          ],
        },
      ],
    },
  },
);

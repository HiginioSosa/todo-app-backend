import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignorar archivos
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/prisma/migrations/**',
      '*.config.js',
      '*.config.mjs',
      'src/frontend/**',
    ],
  },

  // Configuración base de JavaScript
  js.configs.recommended,

  // Configuración para archivos TypeScript de src (BACKEND)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
    },
    rules: {
      // Prettier
      'prettier/prettier': 'error',

      // Desactivar la regla base de no-unused-vars
      'no-unused-vars': 'off',

      // Usar la versión de TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // Configuración para archivos de test
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        project: './tsconfig.spec.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  prettierConfig,
];
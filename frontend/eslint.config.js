import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '*.config.ts', 'vitest.config.ts', 'vite.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Custom naming conventions - relaxed for React components
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase'],
          filter: {
            regex: '^(?!.*Component|Tab|Page|Header|Interface|Creation|Navigation|Notifications|Bar|Boundary|Constants|App|GameHeader|GameInterface|KingdomCreation|ResourceBar|AlliancesTab|AttackTab|BuildingsTab|KingdomTab|MilitaryTab|ResearchTab|GamePage).*$',
            match: true,
          },
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
          filter: {
            regex: '^(?!attackInProgress|victory).*$',
            match: true,
          },
        },
        {
          selector: 'variable',
          format: ['PascalCase'],
          filter: {
            regex: '^.*Constants$',
            match: true,
          },
        },
      ],
      // Allow explicit any in some cases but warn
      '@typescript-eslint/no-explicit-any': 'error',
      // No unused variables
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Separate config for config files
  {
    files: ['*.config.{ts,js}', 'vitest.config.ts', 'vite.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {},
  },
)

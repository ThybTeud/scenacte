import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['coverage', 'node_modules']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
    },
  },
])

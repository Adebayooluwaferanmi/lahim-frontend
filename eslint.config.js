import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        AbortController: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-props-no-spreading': 'off',
      'arrow-body-style': ['warn', 'as-needed'],
      'no-param-reassign': ['error', { props: false }],
      'no-console': 'off',
      'eol-last': ['error', 'always'],
      'no-debugger': 'error',
      curly: ['error', 'all'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
    },
  },
  {
    ignores: ['dist/**', 'build/**', 'commitlint.config.js', 'vite.config.ts', 'vitest.config.ts'],
  },
)

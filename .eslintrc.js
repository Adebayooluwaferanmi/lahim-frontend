module.exports = {
  ignorePatterns: ['commitlint.config.js', 'jest.config.js', 'node_modules/**'],
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb/hooks',
    'prettier',
    'plugin:prettier/recommended',
    'eslint-config-prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: './',
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Suppress plugin conflict warnings - this is a known issue with airbnb config
    'no-restricted-syntax': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-props-no-spreading': 'off',
    'arrow-body-style': ['warn', 'as-needed'],
    'no-param-reassign': ['error', { props: false }],
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'eol-last': ['error', 'always'],
    'no-debugger': 'error',
    'no-nested-ternary': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': ['error', 'never'],
    'import/no-cycle': ['error', { maxDepth: 10 }],
    curly: ['error', 'all'],
  },
}

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:fp-ts/all',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports',
  ],
  root: true,
  rules: {
    'arrow-parens': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'multi-or-nest'],
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    '@typescript-eslint/brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': ['error'],
    '@typescript-eslint/promise-function-async': ['error'],
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'fp-ts/no-module-imports': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['src/**/*.spec.*'] }],
    'import/no-useless-path-segments': ['error', {
      noUselessIndex: true,
    }],
    'import/order': ['error', {
      alphabetize: { order: 'asc' },
      groups: ['builtin', 'external', 'internal', 'index', 'sibling', 'parent'],
    }],
    'lines-between-class-members': ['warn', 'always', {
      exceptAfterSingleLine: true,
    }],
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-multi-spaces': [1, {
      ignoreEOLComments: true,
    }],
    'no-multiple-empty-lines': ['error', {
      max: 1,
      maxBOF: 0,
      maxEOF: 1,
    }],
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'nonblock-statement-body-position': ['error', 'below'],
    'no-param-reassign': 'off',
    'object-shorthand': 'error',
    'padded-blocks': 'off',
    semi: ['error', 'never'],
    'sort-imports': ['error', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
    }],
    'unused-imports/no-unused-imports-ts': 'error',
  },
  overrides: [
    {
      files: ['**/*-spec.ts'],
      extends: [
        'plugin:jest/all',
      ],
      plugins: [
        'jest',
      ],
      rules: {
        'jest/no-conditional-in-test': 'off',
        'jest/no-disabled-tests': 'off',
        'jest/no-hooks': 'off',
        'jest/prefer-expect-assertions': 'off',
        'jest/prefer-expect-resolves': 'off',
        'jest/prefer-lowercase-title': 'off',
        'jest/prefer-to-be': 'error',
        'jest/unbound-method': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
}


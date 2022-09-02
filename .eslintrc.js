module.exports = {
  rules: {
    'import/extensions': [2, 'never'],
    'import/first': 2,
    'import/newline-after-import': 1,
    'import/no-duplicates': 2,
    'import/no-self-import': 2,
    'import/no-unresolved': [2],
    'import/no-useless-path-segments': 2,
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc'
        },
        'newlines-between': 'always'
      }
    ],
    complexity: [2, { max: 5 }],
    'max-params': [1, { max: 4 }],
    'no-console': 2,
    'no-else-return': 1,
    'no-implicit-globals': 2,
    'no-lonely-if': 2,
    'no-multi-spaces': 1,
    'no-prototype-builtins': 0,
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-undef': 2,
    'no-unneeded-ternary': 2,
    'no-useless-catch': 2,
    'no-useless-computed-key': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'no-warning-comments': 1,
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'prefer-const': 2,
    'sort-keys': [
      1,
      'asc',
      {
        natural: true,
        minKeys: 4
      }
    ]
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: true
    }
  }
};

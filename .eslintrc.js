module.exports = {
    'env': {
        'es6': true,
        'jest': true,
        'node': true,
        'browser': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        // 'plugin:react-hooks'
    ],
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'globals': {
        'DEFAULT_EMOJI_URL': true,
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'eqeqeq': [
            'error',
            'always'
        ],
        'no-trailing-spaces': ['error', { 'ignoreComments': true }],
        'consistent-this': 2,
        'import/no-self-import': 2,
        'import/no-internal-modules': 0,
        'import/no-dynamic-require': 0,
        'import/no-useless-path-segments': 2,
        'import/order': 1,
        'import/newline-after-import': 2,
        // "react-hooks/rules-of-hooks": "error",
        // "react-hooks/exhaustive-deps": "warn"
    }
};

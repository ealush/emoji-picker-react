module.exports = {
    'env': {
        'es6': true,
        'jest': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        "plugin:react/recommended"
    ],
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
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
        'no-trailing-spaces': ["error", { "ignoreComments": true }]
    }
};

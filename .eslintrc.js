module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'react-app',
        'react-app/jest',
        'plugin:react/recommended',
        'prettier'
        //'airbnb',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        indent: 0,
        'quote-props': 0,
        'comma-spacing': 0,
        'linebreak-style': 0,
        'react/jsx-indent': 0,
        'no-console': 0,
        'import/no-unresolved': 0,
        'comma-dangle': 0,
        'import/extensions': 0,
        'no-unused-vars': 0,
        'max-len': 0,
        'func-names': 0,
        'no-bitwise': 0,
        'operator-linebreak': 0,
        'padded-blocks': 0,
        'no-trailing-spaces': 0,
        'object-curly-spacing': 0,
        'no-multiple-empty-lines': 0,
        'space-infix-ops': 0,
        'implicit-arrow-linebreak': 0,
        'no-plusplus': ['warn', { allowForLoopAfterthoughts: true }],
        'import/prefer-default-export': 0,
        'react/jsx-filename-extension': 0,
        'react/jsx-one-expression-per-line': 0,
        'react/react-in-jsx-scope': 0,
        '@typescript-eslint/no-unused-vars': 1,
        curly: ['warn', 'multi-line'],
        'object-shorthand': ['warn', 'always'],
        'arrow-body-style': ['warn', 'as-needed']
    }
};

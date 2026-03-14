// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
    ...expoConfig,
    prettier, // disables ESLint rules that conflict with Prettier

    // ── Import ordering ──────────────────────────────────────────────
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        rules: {
            'import/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index']
                    ],
                    'newlines-between': 'never',
                    alphabetize: { order: 'asc', caseInsensitive: true }
                }
            ],
            'import/no-duplicates': 'warn'
        }
    },

    // ── Project-wide rules ───────────────────────────────────────────
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            // TypeScript
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
            ],

            // React
            'react/self-closing-comp': 'warn',
            'react/jsx-curly-brace-presence': [
                'warn',
                { props: 'never', children: 'never' }
            ],

            // General quality
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            eqeqeq: ['error', 'always'],
            curly: ['warn', 'multi-line']
        }
    },

    // ── Ignored paths ────────────────────────────────────────────────
    {
        ignores: ['dist/*', 'node_modules/*', '.expo/*', 'scripts/*']
    }
];

// 共享的 ESLint 配置
module.exports = {
  // 基础配置
  base: {
    env: {
      es2021: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
    },
    ignorePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      '*.config.js',
      '*.config.mjs',
    ],
  },

  // Node.js 环境配置
  node: {
    env: {
      node: true,
      es2021: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'off', // Node.js 允许 console
      'no-debugger': 'error',
    },
    ignorePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      '*.config.js',
      '*.config.mjs',
    ],
  },

  // React 环境配置
  react: {
    env: {
      browser: true,
      es2021: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
    },
    ignorePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      '*.config.js',
      '*.config.mjs',
    ],
  },
};

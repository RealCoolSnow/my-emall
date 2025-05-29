const sharedConfig = require('../../packages/shared/eslint-config');

module.exports = {
  ...sharedConfig.react,
  plugins: ['react-refresh'],
  rules: {
    ...sharedConfig.react.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ]
  }
};

const js = require('@eslint/js');
const globals = require('globals');
const cypress = require('eslint-plugin-cypress/flat');

module.exports = [
  js.configs.recommended,
  cypress.configs.recommended,
  { languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } } },
  { ignores: ['reports/', 'node_modules/'] },
];

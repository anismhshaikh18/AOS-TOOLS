import securityRules from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  {
    ...securityRules.configs['flat/recommended'],
    files: ['**/*.rules'],
  },
];

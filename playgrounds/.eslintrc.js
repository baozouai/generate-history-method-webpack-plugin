module.exports = {
  extends: '../.eslintrc.js',
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-unsafe-return': 'off'
  },
  globals: {
    HISTORY_MODE: "readonly"
  },
}
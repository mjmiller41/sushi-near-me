export default {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'prettier'],
  ignores: ['node_modules', 'dist'],
  rules: {
    'newline-per-chained-call': 2,
    'prettier/prettier': 2 // Means error
  }
}

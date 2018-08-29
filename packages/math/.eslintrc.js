
module.exports = {

  env: {
    browser: true,
    es6: true,
    node: true
  },

  extends: [
    'plugin:react/recommended',
    'standard'
  ],

  parser: 'babel-eslint',

  parserOptions: {
    sourceType: 'module'
  },

  plugins: [
    'react'
  ],

  rules: {
    'react/jsx-boolean-value': 'error',
    'react/jsx-pascal-case': 'error',
    'jsx-quotes': [
      'error',
      'prefer-single'
    ],
    'no-var': 'error',
    'prefer-const': 'error',
    'key-spacing': 'off',
    'padded-blocks': 'off',
    'require-await': 'error',
    'curly': [
      'error',
      'multi'
    ]
  }
}

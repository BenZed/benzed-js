
export default ({ ui }) => {

  const env = {
    browser: ui || undefined,
    es6: true,
    node: true
  }

  const parserOptions = {
    sourceType: 'module'
  }

  const plugins = ui
    ? [ 'react' ]
    : undefined

  const react = ui ? {
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-boolean-value': 'error',
    'react/jsx-pascal-case': 'error',
    'jsx-quotes': [ 'error', 'prefer-single' ]
  } : {}

  const rules = {
    ...react,
    'no-var': 'error',
    'prefer-const': 'error',
    'padded-blocks': 'off',
    'key-spacing': 'off',
    'require-await': 'error',
    'curly': ['error', 'multi']
  }

  const eslint = {
    env,
    extends: 'standard',
    parser: 'babel-eslint',
    parserOptions,
    plugins,
    rules
  }

  return eslint
}

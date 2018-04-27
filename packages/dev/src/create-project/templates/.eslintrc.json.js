
const REACT_RULES = {
  'react/jsx-uses-react': 'error',
  'react/jsx-uses-vars': 'error',
  'react/jsx-no-undef': 'error',
  'react/jsx-no-duplicate-props': 'error',
  'react/jsx-boolean-value': 'error',
  'react/jsx-pascal-case': 'error',
  'jsx-quites': [ 'error', 'prefer-single' ]
}

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

  const rules = {
    ...ui ? REACT_RULES : {},
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

function BabelConfig () {

  if (this instanceof BabelConfig === false)
    throw new Error('BabelConfig must be invoked with \'new\'')

  this.presets = [
    ['@babel/preset-env', {
      'targets': {
        'node': 'current'
      }
    }],
    '@babel/preset-react'
  ]

  this.plugins = [
    // Stage 0
    '@babel/plugin-proposal-function-bind',

    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    // '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { 'loose': true }],
    // ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { 'loose': true }],
    '@babel/plugin-proposal-do-expressions',

    // Stage 2
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',

    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-class-properties',
    // '@babel/plugin-proposal-json-strings',

    // Library
    'babel-plugin-styled-components'
  ]

  const isProduction = process.env.NODE_ENV === 'production'

  this.comments = !isProduction
  this.minified = isProduction

}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = BabelConfig

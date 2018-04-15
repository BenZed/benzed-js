
export function devDependencies ({ has }) {

  return [
    'eslint',
    'babel-eslint',
    'eslint-config-standard',
    'eslint-plugin-import',
    'eslint-plugin-node',
    'eslint-plugin-promise',
    'eslint-plugin-standard',
    has.ui && 'eslint-plugin-react'
  ]

}

export default ({ has, iff }) => `
---
env:
  browser: ${has.ui}
  es6: true
  node: true
extends:
  - standard
  ${iff(has.ui)`- plugin:react/recommended`}
parser: babel-eslint
parserOptions:
  sourceType: module
${iff(has.ui)`plugins:
  - react`}
rules:
  no-var: error
  prefer-const: error
  padded-blocks: off
  key-spacing: off
  require-await: error
  curly:
  - error
  - multi
`

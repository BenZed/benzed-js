
export default ({ has, iff }) => `
{
  "presets": [
    ["env", {
      "targets": {
        "node": "current"
      }
    }],
    ${iff(has.ui)`"react",`}
    "stage-0"
  ]
  ${iff(has.ui)`,
  "plugins": [
    "transform-decorators-legacy",
    "styled-components"
  ]`}
}`

export function devDependencies ({ has }) {
  return [
    'babel-cli',
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-flow',
    has.ui && 'babel-preset-react',
    has.ui && 'babel-plugin-transform-decorators-legacy',
    has.ui && 'babel-plugin-styled-components'
  ]
}

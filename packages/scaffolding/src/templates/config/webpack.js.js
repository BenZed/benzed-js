
export default ({ has, projectName }) => has.ui && `
const { WebpackConfig } = require('@benzed/react')

module.exports = new WebpackConfig()
`

export function devDependencies ({ has }) {
  return has.ui && [
    '@benzed/react'
  ]
}

export default ({ ui, name, api, pretty }) => ui && pretty`
// const { WebpackConfig } = require('@benzed/dev')
const path = require('path')
const port = ${api ? `require('./config/default.json').port - 100` : '5000'}

/******************************************************************************/
// Production
/******************************************************************************/
// const webpackConfig = new WebpackConfig({
//   port
// })

/******************************************************************************/
// DEV
/******************************************************************************/

// TODO Remove this once @benzed packages are all done

const BENZED = path.resolve(__dirname, '../benzed-mono')
const BENZED_HOISTED = path.resolve(BENZED, 'bootstrap', 'node_modules')
const BENZED_PKG = path.resolve(BENZED, 'packages')

const { WebpackConfig } = require(path.join(BENZED_PKG, 'dev'))
const fs = require('fs')
const names = fs.readdirSync(BENZED_PKG)

// Create Webpack Config From Dev
const webpackConfig = new WebpackConfig({ port })

// Resolve BenZed node_modules
webpackConfig.resolve.modules = [ 'node_modules', BENZED_HOISTED ]

// Alias BenZed Packages
webpackConfig.resolve.alias = {}
for (const name of names)
  webpackConfig.resolve.alias[\`@benzed/\${name}\`] = path.join(BENZED_PKG, name)


webpackConfig.resolve.alias['styled-components'] = path.join(BENZED_HOISTED, 'styled-components')
/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = webpackConfig
`

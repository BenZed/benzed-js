// const { WebpackConfig } = require('@benzed/dev')
const path = require('path')

/******************************************************************************/
// Production
/******************************************************************************/
// const webpackConfig = new WebpackConfig({
//   port: 5000
// })

/******************************************************************************/
// DEV
/******************************************************************************/

// TODO Remove this once @benzed packages are all done
const fs = require('fs')

const BENZED = path.resolve(__dirname, '../../../benzed-mono')
const BENZED_NM = path.resolve(BENZED, 'node_modules')
const BENZED_PKG = path.resolve(BENZED, 'packages')

const names = fs.readdirSync(BENZED_PKG)

// Create Webpack Config From Dev
const { WebpackConfig } = require(path.join(BENZED_PKG, 'dev'))
const webpackConfig = new WebpackConfig({
  port: 3030
})

// Resolve BenZed node_modules
webpackConfig.resolve.modules = [
  path.resolve(BENZED_PKG, 'react', 'node_modules'),
  'node_modules',
  BENZED_NM
]
webpackConfig.resolve.alias = {}

// Alias BenZed Packages
for (const name of names)
  webpackConfig.resolve.alias[`@benzed/${name}`] = path.join(BENZED_PKG, name)

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = webpackConfig

const WebpackConfig = require('./lib/webpack-config').default
const path = require('path')

/******************************************************************************/
// Production
/******************************************************************************/

const webpackConfig = new WebpackConfig({
  port: 5000,
  entry: path.resolve('./src/documentation/webpack/index.js'),
  output: path.resolve('./lib/documentation/public')
})

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = webpackConfig

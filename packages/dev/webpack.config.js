const path = require('path')
const WebpackConfig = require('./lib/webpack-config').default

/******************************************************************************/
// Production
/******************************************************************************/

const webpackConfig = new WebpackConfig({
  port: 5000,
  docroot: path.resolve('../'),
  entry: path.resolve('./src/documentation/webpack/index.js'),
  output: path.resolve('./lib/documentation/public')
})

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = webpackConfig

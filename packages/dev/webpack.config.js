const path = require('path')
const DocWebpackConfig = require('./lib/documentation/doc-webpack-config').default

/******************************************************************************/
// Production
/******************************************************************************/

const webpackConfig = new DocWebpackConfig({
  port: 5000,
  docroot: path.resolve('../'),
  entry: path.resolve('./src/documentation/webpack/index.js'),
  output: path.resolve('./lib/documentation/public')
})

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = webpackConfig

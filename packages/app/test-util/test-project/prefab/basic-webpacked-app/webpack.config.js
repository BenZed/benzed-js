const { WebpackConfig } = require('@benzed/dev')
const path = require('path')

const name = path.basename(__dirname)

module.exports = new WebpackConfig({
  entry: path.join(__dirname, 'entry.js'),
  output: path.resolve(__dirname, '../../../../temp', name, 'public'),
  html: path.resolve(__dirname, 'index.html')
})

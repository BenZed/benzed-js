import is from 'is-explicit'
import { DefinePlugin } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'

/******************************************************************************/
// Node Core Modules to not bundle
/******************************************************************************/

const NODE_CORE = [
  'fs', 'child_process', 'cluster', 'http', 'https', 'net', 'os', 'readline',
  'tls', 'tty', 'v8', 'vm', 'zlib', 'module'
]

/******************************************************************************/
// Helper
/******************************************************************************/

function smartFindInput (cwd) {

  const fs = require('fs')
  const path = require('path')

  const webpackIndex = path.join(cwd, 'src/webpack/index.js')
  const plainIndex = path.join(cwd, 'src/index.js')

  if (fs.existsSync(webpackIndex))
    return webpackIndex

  if (fs.existsSync(plainIndex))
    return plainIndex

  throw new Error('config.entry was not provided, and no src entry could be found.')
}

function smartFindOutput (cwd) {

  const fs = require('fs')
  const path = require('path')

  const lib = path.join(cwd, 'lib')
  const dist = path.join(cwd, 'dist')

  const build = (fs.existsSync(lib) && lib) || (fs.existsSync(dist) && dist)
  if (!build)
    throw new Error('config.output was not provided, and build folder could be found.')

  const output = path.join(build, 'public')
  return output
}

function smartFindHtml (cwd, inputFile) {

  const fs = require('fs')
  const path = require('path')

  const inputFolder = path.dirname(inputFile)
  const htmlPublic = path.join(inputFolder, 'public/index.html')
  const htmlPublicLifted = path.resolve(inputFolder, '../public/index.html')

  if (fs.existsSync(htmlPublic))
    return htmlPublic

  if (fs.existsSync(htmlPublicLifted))
    return htmlPublicLifted

  throw new Error('config.html was not provided, and an html template could be found.')
}

function validateConfig (config = { }) {

  const path = require('path')

  if (!is.plainObject(config))
    throw new Error(`if defined, config must be a plain object`)

  const cwd = config.cwd || process.cwd()
  const name = config.name || path.basename(cwd)
  const inputFile = config.entry || smartFindInput(cwd)
  const outputDir = config.output || smartFindOutput(cwd)
  const htmlTemplate = config.html || smartFindHtml(cwd, inputFile)
  const port = config.port || 5000

  const mode = config.mode || (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development')

  if (mode !== 'development' && mode !== 'production')
    throw new Error(`config.mode must either be production or development`)

  return { name, inputFile, outputDir, htmlTemplate, mode, port }
}

/******************************************************************************/
//
/******************************************************************************/

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader'
  },
  {
    test: /\.json$/,
    exclude: /node_modules/,
    loader: 'json-loader'
  },
  {
    test: /\.css/,
    use: [ MiniCssExtractPlugin.loader, 'css-loader' ]
  },
  {
    test: /\.(woff2?|svg)(\?.+)?$/,
    use: [ 'url-loader?limit=10000' ]
  },
  {
    test: /\.(ttf|eot|ico|png|gif|mp4|jpe?g|svg)(\?.+)?$/,
    loader: 'file-loader',
    options: {
      name: '[name]_[hash].[ext]'
    }
  }
]

const resolve = {
  modules: [
    'node_modules',
    path.join(process.cwd(), 'src')
  ]
}

/******************************************************************************/
// Main
/******************************************************************************/

// This is a class specifically for use in scaffolding @benzed projects

function WebpackConfig (config) {

  if (this instanceof WebpackConfig === false)
    throw new Error('WebpackConfig cannot be invoked without \'new\'.')

  const { name, inputFile, outputDir, htmlTemplate, mode, port } = validateConfig(config)

  const isProduction = mode === 'production'

  const entry = {
    [name]: inputFile
  }

  const output = {
    filename: `[name].js`,
    publicPath: '/',
    path: outputDir
  }

  const plugins = [
    new HtmlWebpackPlugin({
      inject: 'head',
      hash: true,
      template: htmlTemplate
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name]_[hash].css'
    })
  ]

  if (isProduction)
    plugins.unshift(
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    )

  const optimization = {
    splitChunks: {
      name: mode !== 'production'
    }
  }

  const node = {}
  for (const core of NODE_CORE)
    node[core] = 'empty'

  const webpack = {

    mode,
    entry,
    output,

    module: {
      rules
    },

    resolve,
    optimization,

    plugins,

    node

  }

  if (!isProduction) {

    delete webpack.node.url
    delete webpack.node.punycode

    webpack.devServer = {
      contentBase: path.dirname(htmlTemplate),
      inline: true,
      hot: false,
      port,
      host: '0.0.0.0',
      historyApiFallback: true,
      stats: {
        warnings: false
      }
    }

    webpack.devtool = 'cheap-source-map'
  }

  return webpack
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default WebpackConfig

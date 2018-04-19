import is from 'is-explicit'

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

  throw new Error('config.inputFile was not provided, and no src entry could be found.')
}

function smartFindOutput (cwd) {

  const fs = require('fs')
  const path = require('path')

  const libPublic = path.join(cwd, 'lib/public')
  const distPublic = path.join(cwd, 'dist/public')

  if (fs.existsSync(distPublic))
    return distPublic

  if (fs.existsSync(libPublic))
    return libPublic

  throw new Error('config.outputDir was not provided, and public folder could be found.')
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

function validateConfig (config = { }, cwd) {

  const path = require('path')

  if (!is.plainObject(config))
    throw new Error(`if defined, config must be a plain object`)

  const name = config.name || path.basename(cwd)
  const inputFile = config.entry || smartFindInput(cwd)
  const outputDir = config.output || smartFindOutput(cwd)
  const htmlTemplate = config.html || smartFindHtml(cwd, inputFile)

  const mode = config.mode || process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development'

  if (mode !== 'development' && mode !== 'production')
    throw new Error(`config.mode must either be production or development`)

  return { name, inputFile, outputDir, htmlTemplate, mode }
}

function ensureDevDependencies (...names) {

  const { devDependencies } = require('../package.json')
  const { execSync } = require('child_process')

  const pkgs = names.filter(name => name in devDependencies === false)

  execSync(`npm i ${pkgs.split(' ')} --save-dev`)
}

/******************************************************************************/
// Main
/******************************************************************************/

// This is a class specifically for use in scaffolding @benzed projects

function WebpackConfig (config) {

  if (this instanceof WebpackConfig === false)
    throw new Error('WebpackConfig cannot be invoked without \'new\'.')

  const cwd = process.cwd()

  const { name, inputFile, outputDir, htmlTemplate, mode } = validateConfig(config, cwd)

  // this is essentially a development class, so we don't want imports used here
  // polluting the @benzed/react module for other use cases
  const { DefinePlugin } = require('webpack')
  const MiniCssExtractPlugin = require('mini-css-extract-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const path = require('path')

  ensureDevDependencies(
    'webpack',
    'babel-loader',
    'json-loader',
    'css-loader',
    'url-loader',
    'file-loader',
    'mini-css-extract-plugin',
    'html-webpack-plugin'
  )

  const entry = {
    [name]: inputFile
  }

  const output = {
    filename: `[name].js`,
    publicPath: '/',
    path: outputDir
  }

  const rules = [
    {
      test: /\.jsx?$/,
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
      test: /\.(ttf|eot|ico|png|gif|mp4|jpg|svg)(\?.+)?$/,
      loader: 'file-loader',
      options: {
        name: '[name]_[hash].[ext]'
      }
    }
  ]

  const resolve = {
    extensions: [ '.js', '.jsx', '.json' ],
    modules: [
      'node_modules',

      // same as add-module-path src
      path.resolve(__dirname, '../src')
    ]
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

  if (mode === 'production')
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

  return {

    mode,
    entry,
    output,

    module: {
      rules
    },

    resolve,
    optimization,

    plugins

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default WebpackConfig

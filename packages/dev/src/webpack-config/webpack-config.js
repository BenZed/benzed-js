
import path from 'path'

import validateConfig from './validate-config'
import getPlugins from './get-plugins'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'

/******************************************************************************/
// Node Core Modules to not bundle
/******************************************************************************/

const NODE_CORE = [
  'fs', 'child_process', 'cluster', 'http', 'https', 'net', 'os', 'readline',
  'tls', 'tty', 'v8', 'vm', 'zlib', 'module'
]

/******************************************************************************/
// Pre Packaged
/******************************************************************************/

const rules = [
  {
    test: path => /\.js$/.test(path) &&
      !/\.test\.js$/.test(path),
    exclude: /node_modules/,
    loader: 'babel-loader'
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

  const {
    name, inputFile, outputDir, htmlTemplate, faviconUrl, mode, port
  } = validateConfig(config)

  const isProduction = mode === 'production'

  const entry = {
    [name]: inputFile
  }

  const output = {
    filename: `[name].js`,
    publicPath: '/',
    path: outputDir
  }

  const plugins = getPlugins(mode, htmlTemplate, faviconUrl)

  const optimization = {
    splitChunks: {
      name: !isProduction
    }
  }

  const node = {}
  for (const coreModuleName of NODE_CORE)
    node[coreModuleName] = 'empty'

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


export default ({ has, projectName }) => has.ui && `
const webpack = require('webpack')
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { DefinePlugin } = webpack
const { ModuleConcatenationPlugin, CommonsChunkPlugin } = webpack.optimize

const pkg = require('../package.json')

/******************************************************************************/
// Data
/******************************************************************************/

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const VENDOR_PREFIXES = [ 'react', 'styled', 'mobx' ]
const MODULES = Object.keys(pkg.dependencies)

/******************************************************************************/
// Entry
/******************************************************************************/

const entry = {
  '${projectName}': path.resolve(__dirname, '../src/webpack/index.js')
}

const vendor = MODULES.reduce((v, mod) => {
  if (VENDOR_PREFIXES.some(prefix => mod.includes(prefix)))
    v.push(mod)

  return v
}, [])

if (vendor.length > 0)
  entry.vendor = vendor

/******************************************************************************/
// Plugins
/******************************************************************************/

const plugins = [
  new ModuleConcatenationPlugin(),
  new HtmlWebpackPlugin({
    inject: 'head',
    hash: true,
    template: 'src/public/index.html'
  }),
  new ExtractTextPlugin('[name].css')
]

// Add CommonChunks if there is more than one entry key
const entries = Object.keys(entry)
if (entries.length > 1) plugins.push(

  new CommonsChunkPlugin({
    names: entries.filter(key => key !== '${projectName}')
  })
)

// Tells React to use production mode
if (IS_PRODUCTION) plugins.push(

  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),

  new UglifyJsPlugin()
)

/******************************************************************************/
// Config
/******************************************************************************/

const _module = {
  rules: [
    {
      test: /\\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },
    {
      test: /\\.json$/,
      exclude: /node_modules/,
      loader: 'json-loader'
    },
    {
      test: /\\.css/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader'
      })
    },
    {
      test: /\\.(ttf|eot|ico|png|gif|mp4|jpg|svg)(\\?.+)?$/,
      loader: 'file-loader',
      options: {
        name: '[name]_[hash].[ext]'
      }
    }
  ]
}

const resolve = {
  extensions: [ '.js', '.jsx', '.json' ],
  modules: [
    'node_modules',

    // same as add-module-path src
    path.resolve(__dirname, '../src')
  ]
}

const output = {
  filename: \`[name].js\`,
  publicPath: '/',
  path: path.join(__dirname, '../dist/public')
}

const node = {
  fs: 'empty',
  path: 'empty'
}

/******************************************************************************/
// Put it all together
/******************************************************************************/

const config = {

  entry,
  output,

  resolve,
  module: _module,

  plugins,

  node

}

if (!IS_PRODUCTION) {
  config.devServer = {
    contentBase: path.resolve(__dirname, '../dist/public'),
    inline: true,
    hot: false,
    port: 5000,
    host: '0.0.0.0',
    historyApiFallback: true,
    stats: {
      warnings: false
    }
  }

  config.devtool = 'eval-source-map'
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = config
`

export function devDependencies ({ has }) {
  return has.ui && [
    'extract-text-webpack-plugin',
    'uglifyjs-webpack-plugin',
    'html-webpack-plugin',
    'webpack',
    'webpack-dev-server',
    'babel-loader',
    'json-loader',
    'css-loader',
    'style-loader',
    'file-loader'
  ]
}

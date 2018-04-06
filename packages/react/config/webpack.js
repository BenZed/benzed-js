const webpack = require('webpack')
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const { DefinePlugin } = webpack

const { ModuleConcatenationPlugin } = webpack.optimize

/******************************************************************************/
// Data
/******************************************************************************/

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/******************************************************************************/
// Entry
/******************************************************************************/

const entry = {
  'benzed-react': path.resolve(__dirname, '../src/webpack/index.js')
}

/******************************************************************************/
// Plugins
/******************************************************************************/

let plugins = [
  new ModuleConcatenationPlugin(),
  new HtmlWebpackPlugin({
    inject: 'head',
    hash: true,
    template: 'src/webpack/public/index.html'
  }),
  new ExtractTextPlugin('[name].css')
]

// Add CommonChunks if there is more than one entry key
const entries = Object.keys(entry)
if (entries.length > 1) plugins = [

  ...plugins

]

if (IS_PRODUCTION) plugins = [

  ...plugins,

  // Tells React to use production mode
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),

  new UglifyJsPlugin()

]

/******************************************************************************/
// Optimization
/******************************************************************************/

const optimization = {
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /\/node_modules\//,
        name: 'vendors',
        chunks: 'all'
      }
    }
  }
}

/******************************************************************************/
// Config
/******************************************************************************/

const _module = {
  rules: [
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
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader'
      })
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
  filename: `[name].js`,
  publicPath: '/',
  path: path.join(__dirname, '../dist/webpack/public')
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
  optimization,

  resolve,
  module: _module,

  plugins,

  node,
  mode: 'production'

}

if (!IS_PRODUCTION) {

  config.mode = 'development'

  config.devServer = {
    contentBase: path.resolve(__dirname, '../dist/webpack/public'),
    inline: true,
    hot: false,
    port: 5500,
    host: '0.0.0.0',
    historyApiFallback: true,
    stats: {
      warnings: false
    }
  }

  config.devtool = 'cheap-module-source-map'
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = config

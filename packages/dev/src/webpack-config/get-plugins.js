
import is from 'is-explicit'

import { DefinePlugin } from 'webpack'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import FaviconsWebpackPlugin from 'webapp-webpack-plugin'

/******************************************************************************/
// Main
/******************************************************************************/

function getPlugins (mode, htmlTemplate, faviconUrl) {

  const plugins = [

    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode)
    }),

    new HtmlWebpackPlugin({
      inject: 'head',
      hash: true,
      template: htmlTemplate
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name]_[hash].css'
    }),

    faviconUrl && new FaviconsWebpackPlugin({
      logo: faviconUrl,
      cache: true,
      prefix: 'favicon-[hash]/',
      inject: true,
      background: 'transparent'
    })

  ].filter(is.object)

  return plugins
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getPlugins

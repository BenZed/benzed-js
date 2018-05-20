import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { TEMP_DIR } from './create-project-index-html'
import is from 'is-explicit'
import { set } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

function createProjectWebpackedUi (name) {

  const prefabFolder = path.join(__dirname, 'prefab', name)
  const webpackConfig = path.join(prefabFolder, 'webpack.config.js')
  if (!fs.existsSync(webpackConfig))
    throw new Error(`${path.basename(webpackConfig, '.js')} test webpack config does not exists`)

  const publicDir = path.join(TEMP_DIR, name, 'public')

  // only webpack it if it doesn't exist
  if (!fs.existsSync(publicDir))
    execSync(`webpack --config ${webpackConfig}`)

  const App = require(path.join(prefabFolder, 'app')).default

  class PrefabApp extends App {

    constructor (config = {}, mode) {
      if (is.plainObject(config))
        config = config::set(['rest', 'public'], publicDir)

      super(config, mode)
    }
  }

  return {
    publicDir,
    App: PrefabApp
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProjectWebpackedUi

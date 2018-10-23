import path from 'path'
import fs from 'fs-extra'
import { TEMP_DIR } from './create-project-index-html'

/******************************************************************************/
// Main
/******************************************************************************/

function createProjectConfigJson (json, name = 'test-project', env = 'default') {

  const configDir = path.join(TEMP_DIR, name, 'config')

  const envJson = path.join(configDir, `${env}.json`)

  if (!fs.existsSync(envJson)) {
    fs.ensureFileSync(envJson)
    fs.writeJsonSync(envJson, json)
  }

  return configDir
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProjectConfigJson

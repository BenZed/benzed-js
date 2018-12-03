import path from 'path'
import is from 'is-explicit'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const { NODE_ENV } = process.env

/******************************************************************************/
// Helper
/******************************************************************************/

const tryReadJson = url => {

  let json
  try {
    json = fs.readJsonSync(url)
  } catch (err) {
    json = {}
  }

  return json
}

const getConfig = (config = path.join(process.cwd(), 'config')) => {

  if (!is.string(config))
    throw new Error('provided config url must be a string')

  const defJson = path.join(config, 'default.json')
  const envJson = NODE_ENV
    ? path.join(config, `${NODE_ENV}.json`)
    : {}

  return {
    ...tryReadJson(defJson),
    ...tryReadJson(envJson)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getConfig

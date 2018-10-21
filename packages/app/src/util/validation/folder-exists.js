import { propToConfig } from '@benzed/schema'
import is from 'is-explicit'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const IS_CLIENT = typeof window === 'object'

/******************************************************************************/
// Helper
/******************************************************************************/

const folderConfig = propToConfig([
  {
    name: 'err',
    test: is.string,
    default: 'must be an existing folder'
  },
  {
    name: 'async',
    test: is.bool,
    default: false
  }
])

async function isExistingFolderAsync (value, { err }) {
  const stat = await fs.stat(value, fs.F_OK)
  return stat.isDirectory()
    ? value
    : throw new Error(err)
}

function isExistingFolderSync (value, { err }) {
  return fs.existsSync(value) && fs.statSync(value).isDirectory()
    ? value
    : throw new Error(err)
}

/******************************************************************************/
// Main
/******************************************************************************/

function folderExists (prop) {

  const config = folderConfig(prop)

  const folderExists = value =>
    IS_CLIENT || !is.string(value)
      ? value
      : config.async
        ? isExistingFolderAsync(value, config)
        : isExistingFolderSync(value, config)

  return folderExists
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default folderExists

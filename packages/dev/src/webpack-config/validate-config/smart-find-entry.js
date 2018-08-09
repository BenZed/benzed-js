import fs from 'fs'
import path from 'path'

/******************************************************************************/
// Main
/******************************************************************************/

function smartFindEntry (cwd) {

  const webpackIndex = path.join(cwd, 'src/webpack/index.js')
  const plainIndex = path.join(cwd, 'src/index.js')

  if (fs.existsSync(webpackIndex))
    return webpackIndex

  if (fs.existsSync(plainIndex))
    return plainIndex

  throw new Error('config.entry was not provided, and no src entry could be found.')

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default smartFindEntry

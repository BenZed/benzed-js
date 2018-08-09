import fs from 'fs'
import path from 'path'

/******************************************************************************/
// Main
/******************************************************************************/

function smartFindOutput (cwd) {

  const lib = path.join(cwd, 'lib')
  const dist = path.join(cwd, 'dist')

  const build = (fs.existsSync(lib) && lib) || (fs.existsSync(dist) && dist)
  if (!build)
    throw new Error('config.output was not provided, and build folder could be found.')

  const output = path.join(build, 'public')
  return output

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default smartFindOutput

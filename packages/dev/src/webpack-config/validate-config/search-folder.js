import path from 'path'
import fs from 'fs'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function searchFolder ({ dir, test, recursive = false }) {

  if (!is.func(test))
    throw new Error('second argument must be a test function')

  const names = fs.readdirSync(dir)

  for (const name of names) {

    const url = path.join(dir, name)
    const stat = fs.statSync(url)

    const result = stat.isDirectory()
      ? recursive
        ? searchFolder({ dir: url, test, recursive })
        : false
      : test(name)

    if (result)
      return url

  }

  return null
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default searchFolder

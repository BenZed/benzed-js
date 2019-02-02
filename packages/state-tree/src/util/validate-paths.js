import validatePath from './validate-path'
import { $$internal } from './symbols'

import { wrap, flatten, first } from '@benzed/array'
import { unique } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

function matchingPath (path) {

  if (path.length !== 1)
    return path

  const memoizers = this

  const key = path::first()
  const match = memoizers.filter(memoizer => memoizer.key === key)::first()

  return match ? match.paths : path
}

/******************************************************************************/
// Main
/******************************************************************************/

const validatePaths = (paths = [], tree) => {

  // Soft validate first, without checking state keys
  paths = wrap(paths)
    .map(validatePath)

  // Cast Memoizer keys to Paths
  const { memoizers } = tree?.constructor?.[$$internal] || {}
  if (memoizers)
    paths = paths
      .map(memoizers::matchingPath)
      .map(flatten)
      .map(path => validatePath(path, tree))

  // Ensure at least one path
  if (paths.length === 0)
    paths.push([])

  return unique(paths)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validatePaths

import { reverse } from '@benzed/immutable'
import { $$internal } from './symbols'

/******************************************************************************/
// Main
/******************************************************************************/

const getPathFromRoot = child => {

  const path = []

  let parent = child
  while (parent && parent.parent) {

    const { pathInParent } = parent[$$internal]

    path.push(...reverse(pathInParent))
    parent = parent.parent
  }

  path.reverse()

  return path
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getPathFromRoot

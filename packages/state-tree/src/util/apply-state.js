import is from 'is-explicit'

import { $$internal } from './symbols'

import { get, equals, reverse } from '@benzed/immutable'

import notifySubscribers from './notify-subscribers'
import transferState from './transfer-state'

/******************************************************************************/
// Helper
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
// Apply
/******************************************************************************/

const applyState = (tree, actionPath, value, actionName) => {

  if (actionPath.length === 0 && !is.plainObject(value))
    throw new Error(
      `action ${actionName} is not scoped to a state key and must ` +
      `return a full state in the form of a plain object.`
    )

  if (actionPath.length === 0) for (const key of Object.keys(value))
    if (!tree.constructor[$$internal].state.keys.includes(key))
      throw new Error(
        `action ${actionName} returned state with invalid key: '${key}'`
      )

  const stateChanged = !equals(get.mut(tree.state, actionPath), value)
  if (stateChanged) {

    const [ previousState, nextState ] = transferState(tree, actionPath, value)
    const pathFromRoot = getPathFromRoot(tree)

    notifySubscribers(
      tree.root,
      pathFromRoot,
      actionPath,
      previousState,
      nextState
    )
  }
  return tree
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default applyState

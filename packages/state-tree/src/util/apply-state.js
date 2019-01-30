import is from 'is-explicit'

import { $$tree } from './symbols'

import { get, equals } from '@benzed/immutable'

import notifySubscribers from './notify-subscribers'
import transferState from './transfer-state'

/******************************************************************************/
// Apply
/******************************************************************************/

const applyState = (tree, path, value, actionName) => {

  if (path.length === 0 && !is.plainObject(value))
    throw new Error(
      `action ${actionName} is not scoped to a state key and must ` +
      `return a full state in the form of a plain object.`
    )

  if (path.length === 0) for (const key of Object.keys(value))
    if (!tree.constructor[$$tree].state.keys.includes(key))
      throw new Error(
        `action ${actionName} returned state with invalid key: '${key}'`
      )

  const stateChanged = !equals(get.mut(tree.state, path), value)
  if (stateChanged) {

    const previousState = transferState(tree, path, value)
    notifySubscribers(tree, path, previousState)
  }

  return tree
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default applyState

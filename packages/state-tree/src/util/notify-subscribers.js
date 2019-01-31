import { $$internal, $$any } from './symbols'

import { get, equals, ValueMap } from '@benzed/immutable'
import { min } from '@benzed/math'

/******************************************************************************/
// Helper
/******************************************************************************/

// TODO this function runs at any state change triggered by any state tree in the
// application ANYWHERE. It will likely need to be optimized.
const normalizeSubscribers = (parent, prunePath) => {

  const parentInternal = parent[$$internal]
  const normalizedSubs = new ValueMap([ ...parentInternal.subscribers ])

  for (const child of parentInternal.children) {

    const { pathInParent } = child[$$internal]

/******************************************************************************/
// FIXME MAKE THIS LESS UGLY \/\/\/
/******************************************************************************/
      let childUpdatePath = null
      let shouldBePruned = false
      if (prunePath && prunePath.length > 0) {

        for (let i = 0; i < min(prunePath.length, pathInParent.length); i++) {
          const parentKey = prunePath[i]
          const childKey = pathInParent[i]
          if (parentKey !== childKey) {
            shouldBePruned = true
            break
          }
        }

        if (!shouldBePruned && pathInParent.length < prunePath.length)
          childUpdatePath = prunePath.slice(pathInParent.length)
      }

      if (shouldBePruned)
        continue
/******************************************************************************/
// FIXME MAKE THIS LESS UGLY /\/\/\
/******************************************************************************/

    const childSubscribers = normalizeSubscribers(child, childUpdatePath)
    for (const [ originalPath, childSubscriptions ] of childSubscribers) {

      const normalizedPath = [
        ...pathInParent,
        ...originalPath
      ]

      const subscriptions = normalizedSubs.get(normalizedPath) || []
      normalizedSubs.set(normalizedPath, [ ...subscriptions, ...childSubscriptions ])
    }
  }

  return normalizedSubs
}

const stateAtSubPathHasChanged = (
  normalizedSubPath, updatePath, pathFromRoot, prevState, nextState
) => {

  // optimization: if the listen path is equal or shorter than the
  // change path then the state must have changed or we wouldn't be here
  if (normalizedSubPath.length < updatePath.length)
    return true

  const subPathRelativeToState = normalizedSubPath.slice(pathFromRoot.length)

  // otherwise we do a value-equal check at the endpoint of the path
  return !equals(
    get.mut(prevState, subPathRelativeToState),
    get.mut(nextState, subPathRelativeToState)
  )

}

/******************************************************************************/
// Main
/******************************************************************************/

const notifySubscribers = (rootTree, pathFromRoot, actionPath, prevState, nextState) => {

  const updatePath = [ ...pathFromRoot, ...actionPath ]

  const normalizedSubs = normalizeSubscribers(rootTree, updatePath)
  if (normalizedSubs.size === 0)
    return

  const applyGlobal = updatePath.length === 0
  const finishedPaths = []

  for (let i = 0; applyGlobal ? i === 0 : i < updatePath.length; i++) {
    const propertyName = applyGlobal ? $$any : updatePath[i]
    const atMaxPathIndex = applyGlobal || i === updatePath.length - 1

    for (const [ normalizedSubPath, subscriptions ] of normalizedSubs) {

      const atMaxSubPathIndex = atMaxPathIndex || i === normalizedSubPath.length - 1
      // if the subscription path ands at an object, it will receive a state
      // update on alteration of any property in that nested path
      const subPropertyName = normalizedSubPath.length > i
        ? normalizedSubPath[i]
        : $$any

      // State Change Mismatch
      const skipSubscriptions =
        subPropertyName !== $$any &&
        propertyName !== $$any &&
        subPropertyName !== propertyName

      const invokeSubscriptions =
        !skipSubscriptions &&
        atMaxSubPathIndex &&
        stateAtSubPathHasChanged(
          normalizedSubPath,
          updatePath,
          pathFromRoot,
          prevState,
          nextState
        )

      if (invokeSubscriptions) for (const subscription of subscriptions)
        subscription.callback(
          subscription.tree,
          subscription.path,
          updatePath
        )

      // subscriber will not be considered for further state calls
      if (invokeSubscriptions || skipSubscriptions)
        finishedPaths.push(normalizedSubPath)
    }

    // optimization: Prune subs as we go up the path
    while (finishedPaths.length > 0)
      normalizedSubs.delete(finishedPaths.pop())

    if (normalizedSubs.size === 0)
      break
  }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default notifySubscribers

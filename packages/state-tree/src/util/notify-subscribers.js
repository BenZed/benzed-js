import { $$internal, $$any } from './symbols'

import { get, equals, ValueMap } from '@benzed/immutable'
import { min } from '@benzed/math'

/******************************************************************************/
// Helper
/******************************************************************************/

const shouldChildSubscribersBePruned = (prunePath, pathInParent) => {

  if (!prunePath || prunePath.length === 0)
    return false

  const length = min(prunePath.length, pathInParent.length)
  for (let i = 0; i < length; i++) {
    const parentKey = prunePath[i]
    const childKey = pathInParent[i]
    if (parentKey !== childKey)
      return true
  }

  return false
}
const normalizeSubscribers = (parent, prunePath) => {

  const parentInternal = parent[$$internal]
  const normalizedSubs = new ValueMap([ ...parentInternal.subscribers ])

  for (const child of parentInternal.children) {

    const { pathInParent } = child[$$internal]

    // Optimization: We collect all subscribers everywhere in the tree at EVERY
    // state change. For a very large tree with many SubStateTrees, this could
    // potentially be very heavy. To mitigate this, we check to see if the update
    // path relative to the parent state tree could potentially include the child
    // and it's subscribers. If not, we don't add their subscribers to the list.
    // TODO: We could also cache the normalized subscribers, and only re-fetch them
    // if a subscriber has changed, somewher.e
    const shouldBePruned = shouldChildSubscribersBePruned(prunePath, pathInParent)
    if (shouldBePruned)
      continue

    const childPrunePath = prunePath &&
    pathInParent.length < prunePath.length
      ? prunePath.slice(pathInParent.length)
      : null

    const childSubscribers = normalizeSubscribers(child, childPrunePath)
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

// Even if it's a valid path, we have to check to see if the statd
// has actually changed at the subscribers sub path:
//    If the state is:
//      { dessert: 'cake', slices: 8 }
//    And the entire state was replaced with:
//      { dessert: 'cake', slices: 7 }
//    And the subscriber path is:
//      [ 'dessert' ]
//    We don't want to invoke the subscriber at that path, because
//    Even though the entire state object has changed, the value of the
//    state at the subscriber path has not.
const stateAtSubPathHasChanged = (
  normalizedSubPath, updatePath, pathFromRoot, prevState, nextState
) => {

  // Optimization: if the listen path is equal or shorter than the
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

// FIXME code-smelly argument count. Hide them in an object like a coward?
const notifySubscribers = (rootTree, pathFromRoot, actionPath, prevState, nextState) => {

  const updatePath = [ ...pathFromRoot, ...actionPath ]

  const normalizedSubs = normalizeSubscribers(rootTree, updatePath)
  if (normalizedSubs.size === 0)
    return

  // console.log(...normalizedSubs.keys())

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

      // Should we call subscribers for this path
      const invokeSubscriptions = !skipSubscriptions && atMaxSubPathIndex
      if (invokeSubscriptions && stateAtSubPathHasChanged(
        normalizedSubPath,
        updatePath,
        pathFromRoot,
        prevState,
        nextState
      ))
        for (const subscription of subscriptions)
          subscription.callback(
            subscription.tree,
            subscription.path,
            updatePath
          )

      if (invokeSubscriptions || skipSubscriptions)
        finishedPaths.push(normalizedSubPath)
    }

    // Optimization: As subscribers are called/ignored, we no longer need to
    // consider them for future updates
    while (finishedPaths.length > 0)
      normalizedSubs.delete(finishedPaths.pop())

    // No more subscribers? Notification complete.
    if (normalizedSubs.size === 0)
      break
  }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default notifySubscribers

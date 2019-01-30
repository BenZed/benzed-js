import { $$subscribers } from './symbols'

import { get, equals, ValueMap } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const $$any = Symbol('update-on-any-path')

/******************************************************************************/
// Main
/******************************************************************************/

const notifySubscribers = (tree, path, previousState) => {

  // if (tree.parent)
  //   notify(tree.root, [ ...getPathToChild(tree), ...path ], tree)

  // only need a shallow copy
  const subs = new ValueMap([ ...tree[$$subscribers] ])
  if (subs.size === 0)
    return

  const { length: pathLength } = path
  const applyGlobal = pathLength === 0

  const finishedPaths = []

  const currentState = tree.state

  for (let i = 0; applyGlobal ? i === 0 : i < pathLength; i++) {
    const propertyName = applyGlobal ? $$any : path[i]
    const atMaxPathIndex = applyGlobal || i === pathLength - 1

    for (const [ subPath, callbacks ] of subs) {
      const subPathLength = subPath.length

      const atMaxSubPathIndex = atMaxPathIndex || i === subPathLength - 1
      // if the subscription path ands at an object, it will receive a state
      // update on alteration of any property in that nested path
      const subPropertyName = subPathLength > i
        ? subPath[i]
        : $$any

      let finished = false

      // subscription path mismatch, this state change is not for this subscriber
      if (subPropertyName !== $$any &&
        propertyName !== $$any &&
        subPropertyName !== propertyName)
        finished = true

      // at final key, send state to subscriber
      if (!finished && atMaxSubPathIndex) {
        finished = true

        const stateAtSubPathHasChanged =

          // optimization: if the listen path is equal or shorter than the
          // change path then the state must have changed or we wouldn't be here
          subPathLength <= pathLength ||

          // otherwise we do a value-equal check at the endpoint of the path
          !equals(
            get.mut(previousState, subPath),
            get.mut(currentState, subPath)
          )

        if (stateAtSubPathHasChanged) for (const callback of callbacks)
          callback(tree, subPath)
      }

      // subscriber will not be considered for further state calls
      if (finished)
        finishedPaths.push(subPath)
    }

    while (finishedPaths.length > 0)
      subs.delete(finishedPaths.pop())

    if (subs.size === 0)
      break
  }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default notifySubscribers

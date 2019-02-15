import { createContext, useContext, useEffect, useState } from 'react'

import { get } from '@benzed/immutable'
import { flatten } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const OBSERVE_DELAY = 0

/******************************************************************************/
// State Tree Context
/******************************************************************************/

const StateTreeContext = createContext()

/******************************************************************************/
// Main
/******************************************************************************/

const useObserveStateTree = (tree, ...paths) => {

  const [ observer, setObserver ] = useState({ observed: tree })

  useEffect(() => {

    const updateObserverWithTree = tree =>
      setObserver({ observed: tree })

    if (observer.observed !== tree)
      updateObserverWithTree(tree)

    const updateListener = () => {
      updateObserverWithTree.delayTimerId =
        setTimeout(
          updateObserverWithTree,
          OBSERVE_DELAY
        )
    }

    tree.subscribe(updateListener, ...paths)

    return () => {
      clearTimeout(updateObserverWithTree.delayTimerId)
      tree.unsubscribe(updateListener)
    }

  }, flatten([ tree, paths ]))

  return observer.observed

}

const useStateTree = (pathFromBase) => {

  const baseTree = useContext(StateTreeContext)

  return pathFromBase
    ? get.mut(baseTree, pathFromBase)
    : baseTree
}

const useStateTreeAtPath = (tree, path) => {

  const getStateAtPath = get.mut.bind(tree, path)

  const [ state, setState ] = useState(getStateAtPath())

  useEffect(() => {

    const mapState = () => setState(getStateAtPath())

    // In case tree switched and state doesn't match
    if (state !== getStateAtPath())
      mapState()

    tree.subscribe(mapState, path)

    return () => tree.unsubscribe(mapState)

  }, flatten([ tree, path ]))

  return state
}

/******************************************************************************/
// Extend
/******************************************************************************/

useStateTree.context = useStateTree
useStateTree.path = useStateTreeAtPath
useStateTree.observe = useObserveStateTree

/******************************************************************************/
// Exports
/******************************************************************************/

export default useStateTree

export {
  StateTreeContext
}

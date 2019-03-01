import { createContext, useContext, useEffect, useState } from 'react'

import { get } from '@benzed/immutable'

import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const OBSERVE_DELAY = 0

/******************************************************************************/
// State Tree Context
/******************************************************************************/

const StateTreeContext = createContext()

/******************************************************************************/
// Helper
/******************************************************************************/

const stringifyPaths = value => is.array(value)
  ? value.map(stringifyPaths).join(',')
  : is.defined(value)
    ? value.toString()
    : `${value}`

/******************************************************************************/
// Main
/******************************************************************************/

const useObserveStateTree = (tree, ...paths) => {

  const [ observer, setObserver ] = useState({ observed: tree })

  useEffect(() => {

    const updateObserverWithTree = () =>
      setObserver({ observed: tree })

    updateObserverWithTree()

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

  }, [ tree, stringifyPaths(paths) ])

  return observer.observed

}

const useStateTree = pathFromBase => {

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

  }, [ tree, stringifyPaths(path) ])

  return state
}

/******************************************************************************/
// Extend
/******************************************************************************/

useStateTree.context = useStateTree
useStateTree.observe = useObserveStateTree
useStateTree.path = useStateTreeAtPath

/******************************************************************************/
// Exports
/******************************************************************************/

export default useStateTree

export {
  StateTreeContext
}

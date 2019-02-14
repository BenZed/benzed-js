import { useContext, useEffect, useState } from 'react'
import StateTreeContext from './context'

import { get } from '@benzed/immutable'
import { first, flatten } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const OBSERVE_DELAY = 0

/******************************************************************************/
// Main
/******************************************************************************/

const useObserveStateTree = (tree, path) => {

  const [ observer, setObserver ] = useState({ observed: tree })

  useEffect(() => {

    const paths = path.length > 0 && is.array(first(path))
      ? path
      : [ path ]

    const updateObserverWithTree = () =>
      setObserver({ observed: tree })

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

  }, flatten([ tree, path ]))

  return observer.observed

}

const useStateTree = (pathFromBase) => {

  const baseTree = useContext(StateTreeContext)

  return pathFromBase
    ? get.mut(baseTree, pathFromBase)
    : baseTree
}

const useStateTreeAtPath = (tree, path) => {

  const [ state, setState ] = useState(get.mut(tree, path))

  useEffect(() => {

    const mapState = () => setState(get.mut(tree, path))

    tree.subscribe(mapState, path)

    return () => tree.unsubcribe(mapState)

  }, [ tree, ...path ])

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

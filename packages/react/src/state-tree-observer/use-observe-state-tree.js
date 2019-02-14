import { useState, useEffect } from 'react'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import StateTree from '@benzed/state-tree'

import { get } from '@benzed/immutable'
import { flatten, first } from '@benzed/array'

import is from 'is-explicit'

import useStateTree from './use-state-tree'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const validateOptions = <object plain strict>
  <array key='root' cast default={[]}>
    <string required />
  </array>

  <array key='path' cast default={[]}>
    <oneOfType required>
      <string />
      <number />
      <symbol />
    </oneOfType>
  </array>

  <StateTree key='tree' />

  <func key='mapToState' default={() => tree => tree}/>
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

/******************************************************************************/
// Main
/******************************************************************************/

const useObserveStateTree = options => {

  if (!useObserveStateTree.warn) {
    useObserveStateTree.warn = true
    console.warn('useObserveStateTree is deprecated already. favour useStateTree.observe instead')
  }

  const {
    tree = useStateTree(),
    root: _root,
    path,
    mapToState
  } = validateOptions(options)

  const rootTree = get.mut(tree, _root)

  const [ mapped, setMapped ] = useState({
    observed: mapToState(rootTree, path)
  })

  useEffect(() => {

    const paths = path.length > 0 && is.array(first(path))
      ? path
      : [ path ]

    let timerId

    const update = (_, path) => {

      const mapped = mapToState(rootTree, path)

      timerId = setTimeout(
        () => setMapped({ observed: mapped }),
        0
      )
    }

    rootTree.subscribe(update, ...paths)

    return () => {
      clearTimeout(timerId)
      rootTree.unsubscribe(update)
    }

  }, flatten([ tree, _root, path, mapToState ]))

  return mapped.observed

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useObserveStateTree

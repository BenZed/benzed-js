import { useContext, useState, useEffect } from 'react'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import StateTree from '@benzed/state-tree'

import StateTreeContext from './context'

import { get } from '@benzed/immutable'
import { flatten, first } from '@benzed/array'

import is from 'is-explicit'

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

  const {
    tree = useContext(StateTreeContext),
    root: _root,
    path,
    mapToState
  } = validateOptions(options)

  const rootTree = get.mut(tree, _root)

  const [ mapped, setMapped ] = useState(rootTree)

  useEffect(() => {

    const paths = path.length > 0 && is.array(first(path))
      ? path
      : [ path ]

    let timerId

    const update = (_, path) => {

      const mapped = mapToState(rootTree, path)

      timerId = setTimeout(
        () => setMapped(mapped),
        0
      )
    }

    rootTree.subscribe(update, ...paths)

    return () => {
      clearTimeout(timerId)
      rootTree.unsubscribe(update)
    }

  }, flatten([ tree, _root, path, mapToState ]))

  return mapped

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useObserveStateTree

import StateTreeObserver from './state-tree-observer'
import StateTreeContext, { StateTreeProvider, StateTreeConsumer, StateTreeListener } from './context'

import useObserveStateTree from './use-observe-state-tree'
import useStateTree from './use-state-tree'

/******************************************************************************/
//
/******************************************************************************/

// useStateTree.context // gets the state tree loaded into context
// useStateTree.path // listen and get state value at a single path
// useStateTree.observe // listen to a state tree

// useStateTree // same as useStateTree.context

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  StateTreeContext,
  StateTreeProvider,
  StateTreeConsumer,

  StateTreeObserver,
  StateTreeListener,

  useObserveStateTree,
  useStateTree

}

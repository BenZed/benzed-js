import { $$internal, $$delete } from './symbols'
import StateTree from '../state-tree'
import { get, set } from '@benzed/immutable'
import { first } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const getChildren = (tree, any, path = null, kids = []) => {

  if (is.plainObject(any))
    for (const key in any)
      getChildren(tree, any[key], path ? [ ...path, key ] : null, kids)

  else if (is.array(any))
    for (let i = 0; i < any.length; i++)
      getChildren(tree, any[i], path ? [ ...path, i ] : null, kids)

  else if (is(any, StateTree)) {

    if (path) {
      any[$$internal].parent = tree
      any[$$internal].pathInParent = path
    }

    kids.push(any)
  }

  return kids
}

const reconsileChildren = (tree, path, prev, next) => {

  const prevChildren = getChildren(tree, prev)
  const nextChildren = getChildren(tree, next, path)

  const firstChild = first(prevChildren)

  const firstIndex = (firstChild && firstChild[$$internal].parentIndex) || 0
  const removeCount = prevChildren.length

  tree[$$internal].children.splice(firstIndex, removeCount, ...nextChildren)

  // set indexes on spliced children
  for (let i = firstIndex; i < tree[$$internal].children.length; i++) {
    const child = tree[$$internal].children[i]
    if (child[$$internal].parentIndex !== i)
      child[$$internal].parentIndex = i

    // if we've gotten here, we don't have to keep setting indexes because
    // they'll all be correct
    else if (i > firstIndex + nextChildren.length)
      break
  }

}

const assertPathDoesntBreakStateBarrier = (tree, path) => {

  let ref = tree[$$internal].state

  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    ref = ref[key]

    if (is(ref, StateTree) && i < path.length - 1)
      throw new Error('Cannot set state inside nested State Trees')

    if (!is.plainObject(ref) && !is.array(ref))
      break
  }

}

const deleteIn = (state, path) => {

  let ref = state
  let key

  for (let i = 0; i < path.length; i++) {
    key = path[i]

    const atLast = i === path.length - 1
    if (atLast)
      break

    ref = ref[key]

    if (!is.plainObject(ref) && !is.array(ref))
      break

  }

  if (key !== undefined && is.plainObject(ref))
    delete ref[key]

  else if (key !== undefined && is.array(ref))
    ref.splice(key, 1)

  return state
}

/******************************************************************************/
// Main
/******************************************************************************/

const transferState = (tree, path, nextValue) => {

  assertPathDoesntBreakStateBarrier(tree, path)

  const state = tree[$$internal].state

  const prevValue = get.mut(state, path)

  tree[$$internal].state = nextValue === $$delete
    ? deleteIn(state, path)
    : set.mut(state, path, nextValue)

  reconsileChildren(tree, path, prevValue, nextValue)

  return prevValue

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default transferState

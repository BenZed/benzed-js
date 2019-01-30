import { $$state } from './symbols'
import StateTree from '../state-tree'

import { get, push, equals, serialize } from '@benzed/immutable'
import { last } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// So, WTF?
/******************************************************************************/

// Q: Why arn't we just using immutable copy?
// A: Updating the parents children array (hoisting new trees and disposing removed ones)
// is not an idempotent operation. Additionally, children can't be frozen, so
// a state trees presence in a state must be replaced with a getter

/******************************************************************************/
// Helper Functions
/******************************************************************************/

const { freeze } = Object

/******************************************************************************/
// Helper Types
/******************************************************************************/

class StateTransferContext {

  constructor (path, value, input, inputPath = [], references = []) {
    this.value = value
    this.valuePath = path

    this.input = input
    this.inputPath = inputPath
    this.references = references
  }

  get current () {
    return equals(this.valuePath, this.inputPath)
      ? this.value
      : this.input
  }

  push (key, input = this.input) {

    const { valuePath, value, inputPath, references } = this

    const nextInputPath = inputPath::push(key)

    return new StateTransferContext(
      valuePath,
      value,
      input,
      nextInputPath,
      references
    )
  }

  addReference (child) {
    this.references.push({
      child,
      key: last(this.inputPath),
      path: this.inputPath.slice(0, this.inputPath.length - 1)
    })
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

const createNextState = (tree, context) => {

  const current = context.current

  if (is(current, StateTree)) {
    context.addReference(current)
    return null
  }

  if (is.array(current))
    return current.map((value, index) =>
      createNextState(
        tree,
        context.push(index, value)
      )
    )

  if (is.object(current)) {
    const output = {}
    for (const key in current)
      output[key] = createNextState(
        tree,
        context.push(key, current[key])
      )

    return output
  }

  return current
}

const reconsileChildren = (tree, context, nextState) => {

  const oldChildren = [ ...tree.children ]
  const newChildren = []

  for (const { path, key, child } of context.references) {

    const oldIndex = oldChildren.indexOf(child)

    const isNewChild = oldIndex === -1
    if (isNewChild) {
      child[$$state].parent = tree
      child[$$state].pathInParent = path::push(key)
    } else
      oldChildren.splice(oldIndex, 1)

    const index = newChildren.length
    newChildren.push(child)

    const host = get.mut(nextState, path)
    if (!host)
      throw new Error('something fucked up. There should be a host, here.')
    Object.defineProperty(host, key, {
      enumerable: true,
      get () {
        return tree.children[index]
      }
    })

  }

  for (const removedChild of oldChildren) {
    // TODO remove child. Dispose? Remove Listeners? Transfer Listeners?
  }

  tree[$$state].children = newChildren

}

/******************************************************************************/
// Main
/******************************************************************************/

const transferState = (tree, path, value) => {

  const currentState = tree.state
  const context = new StateTransferContext(path, value, currentState)

  const nextState = createNextState(tree, context)

  reconsileChildren(tree, context, nextState)
  // console.log(tree.children, context.children)
  //

  tree[$$state].state = freeze(nextState)

  return currentState

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default transferState

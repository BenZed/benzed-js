import { $$internal } from './symbols'
import StateTree from '../state-tree'

import { get, push, equals, serialize } from '@benzed/immutable'
import { last } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// So, WTF?
/******************************************************************************/

// Q: Why arn't we just using @benzed/immutable copy?
// A: Updating the parents children array (hoisting new trees subscribers and
// disposing removed ones) is not an idempotent operation. Additionally, child
// StateTrees can't be frozen, or their actions wouldn't work, so we need to
// Object.defineProperty getters in their host paths to their indexes in the parentTree.children array.

// Q: That sounds waaaay overcomplicated. Why is it so important that the state
// is frozen? Why not just add "don't mutate the state without calling an action"
// to the README.md?
// A: Shut the fuck up

/******************************************************************************/
// Helper Types
/******************************************************************************/

// We need to traverse the state when doing a state transfer.
// It is passed a context that tracks which part of the state is changing rather
// than being duplicated. If it encounters state trees, it stores them as references
// rather than making copies.

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
// Helper Functions
/******************************************************************************/

const { freeze } = Object

const assignParent = (child, parent, path) => {

  child[$$internal].parent = parent
  child[$$internal].pathInParent = path

}

const clearParent = child => {
  child[$$internal].parent = null
  child[$$internal].pathInParent = null
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

    // Determine if child is new. If it is, it needs some preliminary
    // setup. Perhaps hoisting should go here.
    const oldIndex = oldChildren.indexOf(child)
    const isNewChild = oldIndex === -1

    if (isNewChild)
      assignParent(child, tree, path::push(key))
    else
      oldChildren.splice(oldIndex, 1)

    // TODO remove this when finished, as it should not happen
    if (!isNewChild && child[$$internal].parent !== tree)
      throw new Error(
        'Child parent mismatch. Children cannot be moved from parent ' +
        'to parent, and they cannot be used by multiple parents.'
      )

    // Assign Getter in nextState to where it will exist in tree.children
    const index = newChildren.length
    newChildren.push(child)

    const host = get.mut(nextState, path)
    if (!host) // TODO remove this, as it should not happen anyway
      throw new Error('something fucked up. There should be a host, here.')
    Object.defineProperty(host, key, {
      enumerable: true,
      get () {
        return tree.children[index]
      }
    })

  }

  for (const removedChild of oldChildren)
    clearParent(removedChild)

  tree[$$internal].children = newChildren

}

/******************************************************************************/
// Main
/******************************************************************************/

const transferState = (tree, path, value) => {

  const currentState = tree.state
  const context = new StateTransferContext(path, value, currentState)

  const nextState = createNextState(tree, context)

  reconsileChildren(tree, context, nextState)

  // TODO remove me when finished, this shouldn't happen
  for (const child of tree.children)
    if (child[$$internal].parent !== tree)
      throw new Error('A single StateTree cannot have multiple parents')

  tree[$$internal].state = freeze(nextState)

  return [
    serialize(currentState),
    serialize(nextState)
  ]

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default transferState

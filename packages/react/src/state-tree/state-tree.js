import is from 'is-explicit'

import { equals, copy, get, set, reverse } from '@benzed/immutable'
import { wrap } from '@benzed/array'
import { inspect } from 'util'

/******************************************************************************/
// Data
/******************************************************************************/

const $$subscribers = Symbol('subscribers')

const $$state = Symbol('state')
const $$setters = Symbol('setters')

const $$any = Symbol('update-on-any-path')
const $$parentkey = Symbol('state-key-in-parent')

/******************************************************************************/
// Helper
/******************************************************************************/

const applyState = (tree, value, path = []) => {

  // TODO allow @benzed/immutable set to work on functions then fix this

  const state = tree[$$state]

  const hasPath = path && path.length > 0
  const stateAtPath = hasPath
    ? get.mut(state, path)
    : state

  const stateIsNotChanging = equals(stateAtPath, value)
  if (stateIsNotChanging)
    return false

  if (hasPath) {

    checkStateKey(tree, path[0])
    set.mut(state, path, value)

  } else for (const key in value) {
    checkStateKey(tree, key)
    state[key] = value[key]
  }

  return true
}

const getSetter = (tree, path) => {

  const key = path.join('')

  let setter = tree[$$setters].get(key)
  if (!setter) {
    setter = value => {

      const stateChanged = applyState(tree, value, path)
      if (stateChanged)
        notify(tree, path)

      return stateChanged
    }

    tree[$$setters].set(key, setter)
  }

  return setter
}

const getState = (tree, path = []) => {

  const state = tree[$$state]

  return path.length > 0
    ? get.mut(state, path)
    : state
}

const notify = (tree, path, sourceTree = tree) => {

  if (tree.parent)
    notify(tree.root, [ ...getPathToChild(tree), ...path ], tree)

  // reversed so subscribers can be removed without complicating the loop
  const subs = reverse(tree[$$subscribers])
  if (subs.length === 0)
    return

  const { length: pathLength } = path

  for (let i = 0; i < pathLength; i++) {
    const stateKey = path[i]
    const atMaxPathIndex = i === pathLength - 1

    for (let j = subs.length - 1; j >= 0; j--) {
      const sub = subs[j]

      const subPathLength = sub.path.length
      const atMaxSubPathIndex = i === subPathLength - 1 || atMaxPathIndex
      // if the subscription path ands at an object, it will receive a state
      // update on alteration of any property in that nested path
      const subKey = subPathLength > i
        ? sub.path[i]
        : $$any

      let finished = false

      // subscription path mismatch, this state change is not for this subscriber
      if (subKey !== $$any && subKey !== stateKey)
        finished = true

      // at final key, send state to subscriber
      if (!finished && atMaxSubPathIndex) {
        finished = true
        sub.callback(sourceTree, sub.path)
      }

      // subscriber will not be considered for further state calls
      if (finished)
        subs.splice(j, 1)
    }

    if (subs.length === 0)
      break
  }

}

const checkStateKey = (tree, key) => {

  if (key in tree[$$state] === false)
    throw new Error(`'${key}' is not a valid state key.`)

}

const getPathToChild = child => {

  const path = []

  let parent = child
  while (parent && parent.parent) {
    path.push(parent[$$parentkey])
    parent = parent.parent
  }

  path.reverse()

  return path
}

const hoistSubscriber = (tree, callback, path, pathToChild) => {

  if (!pathToChild)
    pathToChild = getPathToChild(tree)

  tree.root.subscribe(callback, [ ...pathToChild, ...path ])

}

/******************************************************************************/
// Setup
/******************************************************************************/

const applyInitialState = (tree, initial) => {

  const keys = Object.keys(initial)

  for (const key of keys) {

    if (key in tree)
      throw new Error(`'${key}' cannot be used as a state key.`)

    Object.defineProperty(tree, key, {
      get () {
        return this[$$state][key]
      },
      enumerable: true
    })

  }

  Object.defineProperties(tree, {
    [$$state]: { value: copy(initial) },
    [$$setters]: { value: new Map() }
  })

  applyState(tree, initial)

  // hoist subscribers
  for (const key of keys) {
    const value = tree[$$state][key]
    const isNestedState = is.object(value) && $$state in value
    if (isNestedState)
      hoistSubscribers(tree, value, key)
  }

}

const addActions = (tree, actions) => {

  const keys = Object.keys(actions)
  for (const key of keys) {

    if (key in tree)
      throw new Error(`'${key}' cannot be used as an action key.`)

    const action = actions[key]

    if (!is.func(action))
      throw new Error(`actions.${key} is not a function`)

    tree[key] = tree::action
  }

}

const addSubcription = (tree) => {

  Object.defineProperties(tree, {
    [$$subscribers]: { value: [] },
    subscribe: { value: subscribe },
    unsubscribe: { value: unsubscribe },
    root: { get () {
      let _root = this.parent

      while (_root && _root.parent)
        _root = _root.parent

      return _root
    } },
    parent: { value: null, configurable: true, writable: true },
    [$$parentkey]: { value: null, configurable: true, writable: true }
  })

}

const hoistSubscribers = (tree, child, key) => {

  child.parent = tree
  child[$$parentkey] = key

  const pathToChild = getPathToChild(child)

  while (child[$$subscribers].length > 0) {
    const { func, path } = child[$$subscribers].shift()
    hoistSubscriber(child, func, path, pathToChild)
  }

}

/******************************************************************************/
// Instance Methods
/******************************************************************************/

function subscribe (callback, ...paths) {
  if (!is.func(callback))
    throw new Error('callback argument must be a function')

  if (paths.length === 0)
    paths.push([])

  for (let path of paths) {

    // cast path
    if (!is.defined(path))
      path = []
    else
      path = wrap(path)

    // validated path
    if (path.length > 0 && !is.arrayOf(path, [String, Symbol]))
      throw new Error('paths must be arrays of strings or symbols')

    if (this.parent)
      hoistSubscriber(this, callback, path)
    else
      this[$$subscribers].push({ callback, path })
  }
}

function unsubscribe (callback) {
  if (!is.func(callback))
    throw new Error('callback argument must be a function')

  if (this.parent)
    return this.root.unsubscribe(callback)

  const subs = this[$$subscribers]

  for (let i = subs.length - 1; i >= 0; i--)
    if (equals(subs[i].callback, callback))
      subs.splice(i, 1)
}

function stateTreeToJSON () {
  const tree = this
  const state = tree[$$state]

  return copy.json(state)
}

function stateTreeToString () {

  const tree = this
  return inspect(tree[$$state])

}

/******************************************************************************/
// Main
/******************************************************************************/

function StateTree (initial, actions) {

  if (!is.plainObject(initial))
    throw new Error('initial state must be a plain object.')

  if (!is.plainObject(actions))
    throw new Error('actions must be a plain object.')

  const stateTree = path => {

    if (!is.array(path))
      path = is.defined(path)
        ? [ path ]
        : []

    const value = getState(stateTree, path)
    const set = getSetter(stateTree, path)

    const _interface = [ value, set ]
    _interface.value = value
    _interface.set = set

    return _interface
  }

  addSubcription(stateTree)
  addActions(stateTree, actions)
  applyInitialState(stateTree, initial)

  stateTree.toJSON = stateTreeToJSON
  stateTree.toString = stateTreeToString

  return stateTree
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTree

export {
  $$state,
  $$setters
}

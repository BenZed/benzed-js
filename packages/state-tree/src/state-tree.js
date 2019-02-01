import { copy, equals, serialize, ValueMap } from '@benzed/immutable'

import { isArrayOfPaths, normalizePaths, applyState, $$internal } from './util'

import * as decorators from './decorators'
import is from 'is-explicit'

/******************************************************************************/
// Helpers
/******************************************************************************/

const { freeze } = Object

function runAction (...args) {

  const [ tree, action, path ] = this

  const result = action(...args)

  return is(result, Promise)
    ? result.then(resolved => applyState(tree, path, resolved, action.name))
    : applyState(tree, path, result, action.name)
}

const bindActions = tree => {

  const { actions } = tree.constructor[$$internal]

  for (const { key, func, call, path } of actions) {

    const action = call ? tree::func() : tree::func
    Object.defineProperty(action, 'name', {
      value: key.toString()
    })

    tree[$$internal].actions[key] = [ tree, action, path ]::runAction

    Object.defineProperty(tree[$$internal].actions[key], 'name', {
      value: 'action bound ' + key.toString()
    })
  }

}

const applyInitialState = (tree, dynamicStateInitial = {}) => {

  if (!is.plainObject(dynamicStateInitial))
    throw new Error('initial state must be a plain object')

  const { stateInitial } = tree.constructor[$$internal]

  applyState(
    tree,
    [],
    copy({ ...stateInitial, ...dynamicStateInitial }),
    'setInitialState'
  )

}

const subscribeMemoizers = tree => {

  const { memoizers } = tree.constructor[$$internal]

  for (const { paths, get, key } of memoizers) {

    const getter = tree::get
    const memoizer = () => {
      tree[$$internal].memoized[key] = getter()
    }

    Object.defineProperty(memoizer, 'name', { value: `memoized get ${key}` })
    tree.subscribe(memoizer, ...paths)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class StateTree {

  get [Symbol.toStringTag] () {
    return 'StateTree'
  }

  static decorators = decorators

  static [$$internal] = {
    stateInitial: {},
    stateKeys: [],
    actions: [],
    memoizers: []
  };

  [$$internal] = {
    state: freeze({ }),
    memoized: { },
    actions: { },
    children: [],
    parent: null,
    pathInParent: null,
    subscribers: new ValueMap()
  };

  constructor (dynamicInitial) {
    bindActions(this)
    subscribeMemoizers(this)
    applyInitialState(this, dynamicInitial)
  }

  get state () {
    return this[$$internal].state
  }

  subscribe (callback, ...paths) {

    const { subscribers } = this[$$internal]

    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    if (!isArrayOfPaths(paths))
      throw new Error('paths must be arrays of numbers, strings or symbols')

    for (const path of normalizePaths(paths)) {

      const subscription = { callback, tree: this, path }
      const subscriptions = subscribers.get(path) || []

      subscribers.set(path, [ ...subscriptions, subscription ])
    }

    return this
  }

  unsubscribe (callback) {
    const { subscribers } = this[$$internal]

    const paths = [ ...subscribers.keys() ]

    for (const path of paths) {

      const subscriptions = subscribers
        .get(path)
        .filter(subscription => !equals(subscription.callback, callback))

      if (subscriptions.length === 0)
        subscribers.delete(path)
      else
        subscribers.set(path, subscriptions)
    }

    return this
  }

  toJSON () {

    const { state } = this

    return serialize({ ...state, ...this[$$internal].memoized })
  }

  [equals.$$] (other) {
    return is(other, this.constructor) && equals(this.toJSON(), other.toJSON())
  }

  [copy.$$] () {
    const clone = new this.constructor()
    const { state } = this[$$internal]

    // TODO Should I be copying subscribers as well?
    // If so, it means that if I copy a state tree, the subscriber
    // will receive updates from state changes from either the original
    // or the copy. That seems bad. But then, would I only be copying a state
    // tree if the previous was being discarded? I don't know man.

    applyState(clone, [], state, 'setClonedState')

    return clone
  }

  get root () {
    let _root = this.parent || this

    while (_root && _root.parent)
      _root = _root.parent

    return _root
  }

  get parent () {
    return this[$$internal].parent
  }

  get children () {
    return this[$$internal].children
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTree

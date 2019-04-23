import { get, copy, equals, serialize, ValueMap } from '@benzed/immutable'

import {

  getPathFromRoot,
  validatePath,
  validatePaths,
  transferState,
  notifySubscribers,

  $$internal,
  $$delete
} from './util'

import * as decorators from './decorators'
import is from 'is-explicit'

/******************************************************************************/
// Helpers
/******************************************************************************/

function runAction (...args) {

  const [ tree, action, path ] = this

  const result = action(...args)

  return is(result, Promise)
    ? result.then(resolved => tree.setState(resolved, path, action.name))
    : tree.setState(result, path, action.name)
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

  tree.setState(
    { ...copy(stateInitial), ...dynamicStateInitial },
    [],
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
    state: { },
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

  setState (value, actionPath = [], actionName = 'setState') {

    if (actionPath.length === 0 && !is.plainObject(value))
      throw new Error(
        `action ${actionName} is not scoped to a state key and must ` +
        `return a full state in the form of a plain object.`
      )

    const { stateKeys } = this.constructor[$$internal]

    actionPath = validatePath(actionPath, this)
    if (actionPath.length === 0 && stateKeys.length > 0)
      for (const key of Object.keys(value))
        if (!stateKeys.includes(key))
          throw new Error(
            `action ${actionName} returned state with invalid key: '${key}'`
          )

    const stateChanged = !equals(get.mut(this.state, actionPath), value)
    if (stateChanged) {

      const prevValue = transferState(this, actionPath, value)
      const pathFromRoot = getPathFromRoot(this)

      notifySubscribers(
        this.root,
        pathFromRoot,
        actionPath,
        prevValue,
        value
      )

    }

    return stateChanged
  }

  deleteState (actionPath = [], actionName = 'deleteState') {

    if (actionPath.length === 0)
      throw new Error('Cannot delete entire state.')

    actionPath = validatePath(actionPath, this)

    const prevValue = transferState(this, actionPath, $$delete)
    const pathFromRoot = getPathFromRoot(this)

    notifySubscribers(
      this.root,
      pathFromRoot,
      actionPath,
      prevValue,
      undefined
    )

    return true

  }

  subscribe (callback, ...paths) {

    const { subscribers } = this[$$internal]

    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    for (const path of validatePaths(paths, this)) {

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

    clone.setState(state, [], 'setClonedState')

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

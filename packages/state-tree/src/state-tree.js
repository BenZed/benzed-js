import { copy, equals, push, serialize, set, ValueMap } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import { applyState, $$tree, $$state, $$subscribers } from './util'

import * as decorators from './decorators'
import is from 'is-explicit'

/******************************************************************************/
// Helpers
/******************************************************************************/

const { freeze } = Object

const applyInitialState = tree => {

  const { initial } = tree.constructor[$$tree].state

  applyState(tree, [], initial, 'setInitialState')

}

const subscribeMemoizers = tree => {

  const { memoizers } = tree.constructor[$$tree]

  for (const { paths, get, key } of memoizers) {

    const getter = tree::get

    const memoizer = Object.defineProperty(() => {

      const value = getter()

      tree[$$state].memoized = freeze(set(tree.memoized, key, value))

    }, 'name', { value: `memoized get ${key}` })

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

  static [$$tree] = {
    state: {
      initial: {},
      keys: []
    },
    memoizers: []
  };

  [$$state] = {
    state: freeze({ }),
    memoized: freeze({ }),
    children: [],
    parent: null,
    pathInParent: null
  };

  [$$subscribers] = new ValueMap()

  constructor () {
    subscribeMemoizers(this)
    applyInitialState(this)
  }

  get state () {
    return this[$$state].state
  }

  get memoized () {
    return this[$$state].memoized
  }

  subscribe (callback, ...paths) {

    const subs = this[$$subscribers]

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

      const callbacks = subs.has(path) ? subs.get(path) : []

      subs.set(path, callbacks::push(callback))
    }

  }

  unsubscribe (callback) {
    const subs = this[$$subscribers]

    const paths = [ ...subs.keys() ]

    for (const path of paths) {

      const callbacks = subs
        .get(path)
        .filter(existingCallback => !equals(existingCallback, callback))

      if (callbacks.length === 0)
        subs.delete(path)
      else
        subs.set(path, callbacks)
    }

  }

  toJSON () {

    const { memoized, state } = this

    return serialize({ ...state, ...memoized })
  }

  [equals.$$] (other) {
    return is(other, this.constructor) && equals(this.toJSON(), other.toJSON())
  }

  [copy.$$] () {
    const clone = new this.constructor()
    const { state } = this[$$state]

    return applyState(clone, [], state, 'setClonedState')
  }

  get root () {
    let _root = this.parent

    while (_root && _root.parent)
      _root = _root.parent

    return _root
  }

  get parent () {
    return this[$$state].parent
  }

  get children () {
    return this[$$state].children
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StateTree

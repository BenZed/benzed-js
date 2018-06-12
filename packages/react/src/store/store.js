import { get, set, copy, equals, COPY, EQUALS, reverse } from '@benzed/immutable'
import is from 'is-explicit'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const ANY = Symbol('update-on-any-path')

const SUBSCRIBERS = Symbol('subscribers')

const STATE_UNCHANGED = Symbol('state-unchanged')

/******************************************************************************/
// Helpers
/******************************************************************************/

function assertPath (store, path) {

  path = wrap(path)

  const [ key ] = path

  if (key in store === false ||
    store[key] instanceof Function ||
    key === SUBSCRIBERS ||
    key === EQUALS ||
    key === COPY
  )
    throw new Error(`Cannot set ${path.join('.')}, ${key} is not a valid state property.`)

  return path
}

/******************************************************************************/
// State Change
/******************************************************************************/

function createNewState (store, path, value) {

  const isEqual = equals(
    get.mut(store, path),
    value
  )

  return isEqual
    ? STATE_UNCHANGED
    : set(store, path, value)

}

function notifyStoreSubscribers (store, path, state) {

  const subs = reverse(store[SUBSCRIBERS])

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
        : ANY

      let finished = false

      // subscription path mismatch, this state change is not for this subscriber
      if (subKey !== ANY && subKey !== stateKey)
        finished = true

      // at final key, send state to subscriber
      if (!finished && atMaxSubPathIndex) {
        finished = true
        sub.callback(state, sub.path)
      }

      // subscriber will not be considered for further state calls
      if (finished)
        subs.splice(j, 1)
    }

    if (subs.length === 0)
      break
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class Store {

  [SUBSCRIBERS] = [];

  [COPY] () {
    const state = {}

    for (const key in this) {
      const value = this[key]
      if (typeof value !== 'function')
        state[key] = copy(value)
    }

    return state
  }

  [EQUALS] (input) {

    if (input === null || typeof input !== 'object')
      return false

    for (const key in this) {
      const value = this[key]

      if (typeof value !== 'function')
        if (!equals(value, input[key]))
          return false
    }

    return true
  }

  set (path, value) {

    path = assertPath(this, path)

    const state = createNewState(this, path, value)
    if (state === STATE_UNCHANGED)
      return

    for (const key in state)
      this[key] = state[key]

    notifyStoreSubscribers(this, path, state)
  }

  get (path) {
    const store = this

    return get.mut(store, path)
  }

  subscribe (callback, ...paths) {

    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    if (paths.length === 0)
      paths.push([])

    for (let path of paths) {

      if (!is.defined(path))
        path = []

      path = wrap(path)

      if (path.length > 0 && !is.arrayOf(path, String, Symbol))
        throw new Error('paths must be arrays of strings or symbols')

      this[SUBSCRIBERS].push({ callback, path })
    }

  }

  unsubscribe (callback) {

    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    const subs = this[SUBSCRIBERS]

    for (let i = subs.length - 1; i >= 0; i--)
      if (equals(subs[i].callback, callback))
        subs.splice(i, 1)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

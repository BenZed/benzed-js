import { get, set, copy, equals, reverse } from '@benzed/immutable'
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

function buildState (store, path, value) {

  const [ key ] = path

  if (key in store === false || store[key] instanceof Function || key === SUBSCRIBERS)
    throw new Error(`Cannot set ${path.join('.')}, ${key} is not a valid state property.`)

  const isEqual = equals(
    get.mut(store, path),
    value
  )

  return isEqual
    ? STATE_UNCHANGED
    : set(store, path, value)

}

function notifySubscribers (store, path, state) {

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
        sub.func(state, sub.path)
      }

      // subscriber will not be considered for further state calls
      if (finished)
        subs.splice(j, 1)
    }

    if (subs.length === 0)
      break
  }

}

function applyState (store, state) {

  for (const key in state)
    store[key] = state[key]

}

/******************************************************************************/
// Main
/******************************************************************************/

class Store {

  [SUBSCRIBERS] = []

  set (path, value) {

    path = wrap(path)

    const state = buildState(this, path, value)
    if (state === STATE_UNCHANGED)
      return

    applyState(this, state)

    notifySubscribers(this, path, state)
  }

  get (path) {
    return get.mut(this, path)
  }

  copy () {
    const state = {}

    for (const key in this) {
      const value = this[key]
      if (typeof value !== 'function')
        state[key] = copy(value)
    }

    return state
  }

  equals (input) {

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

  subscribe (func, path) {
    this[SUBSCRIBERS].push({
      func,
      path: path ? wrap(path) : []
    })
  }

  unsubscribe (func) {
    const subs = this[SUBSCRIBERS]

    for (let i = subs.length - 1; i >= 0; i--)
      if (equals(subs[i].func, func))
        subs.splice(i, 1)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

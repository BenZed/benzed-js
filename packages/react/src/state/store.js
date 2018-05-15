import { get, set, copy, equals } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const SUBSCRIBERS = Symbol('subscribers')

const ANY = Symbol('update-on-any-path')

const STATE_UNCHANGED = Symbol('state-unchanged')

/******************************************************************************/
// Helpers
/******************************************************************************/

function build (store, path, value) {

  const [ key ] = path
  if (key in store === false || store[key] instanceof Function)
    throw new Error(`Cannot set ${path.join('.')}, ${key} is not a valid state property.`)

  const isEqual = equals(
    get.mut(store, path),
    value
  )

  return isEqual
    ? STATE_UNCHANGED
    : set(store, path, value)

}

function reverse (array) {

  const reversed = [ ...array ]

  reversed.reverse()

  return reversed
}

function notify (store, path, state) {

  const subs = reverse(store[SUBSCRIBERS])

  const { length: pathLength } = path

  for (let i = 0; i < pathLength; i++) {
    const stateKey = path[i]

    const atMaxPathIndex = i === pathLength - 1

    for (let ii = subs.length - 1; ii >= 0; ii--) {
      const sub = subs[ii]

      const subPathLength = sub.path.length

      const atMaxSubPathIndex = i === subPathLength - 1 || atMaxPathIndex
      const subKey = subPathLength > i
        ? sub.path[i]
        : ANY

      let finished = false

      // path mismatch, this state change is not for this subscriber
      if (subKey !== ANY && subKey !== stateKey)
        finished = true

      // at final key, send state to subscriber
      if (!finished && atMaxSubPathIndex) {
        finished = true
        sub.func(state, sub.path)
      }

      // subscriber will not be considered for further state calls
      if (finished)
        subs.splice(ii, 1)
    }

    if (subs.length === 0)
      break
  }

}

function apply (store, state) {

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

    const state = build(this, path, value)
    if (state === STATE_UNCHANGED)
      return

    notify(this, path, state)

    // TODO Do something with new state
    // serialize it, log it to history, whatever

    // console.log(state)

    apply(this, state)

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

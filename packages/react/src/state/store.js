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

  const stateOld = store.copy()

  const [ key ] = path
  if (key in stateOld === false)
    throw new Error(`Cannot set ${path}, ${key} is not a valid state property.`)

  const stateNew = set(stateOld, path, value)

  const isEqual = equals(
    get.mut(stateNew, path),
    get.mut(stateOld, path)
  )

  return isEqual
    ? STATE_UNCHANGED
    : stateNew

}

function reverse (array) {

  const reversed = [ ...array ]

  reversed.reverse()

  return reversed
}

function notify (store, path, state) {

  const subs = reverse(store[SUBSCRIBERS])

  const { length: pathLength } = path

  const start = Date.now()

  let count = 0

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
        count++
      }

      // subscriber will not be considered for further state calls
      if (finished)
        subs.splice(ii, 1)
    }

    if (subs.length === 0)
      break
  }

  console.log(Date.now() - start, 'ms to update', count, 'subscribers')

}

function apply (store, path, state) {

  const [ key ] = path

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

    apply(this, path, state)

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
      if (subs[i].func === func)
        subs.splice(i, 1)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

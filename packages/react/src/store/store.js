import is from 'is-explicit'

import { get, set, copy, equals, EQUALS, reverse } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import { TASK } from './task'

/******************************************************************************/
// Symbol Keys
/******************************************************************************/

const SUBSCRIBERS = Symbol('subscribers')

/******************************************************************************/
// Symbol Values
/******************************************************************************/

const ANY = Symbol('update-on-any-path')

/******************************************************************************/
// Helpers
/******************************************************************************/

function assertPath (store, path) {

  path = wrap(path)

  const [ key ] = path

  if ((key in store === false) ||
    (is.func(store[key]) && TASK in store[key] === false) ||
    key === SUBSCRIBERS ||
    key === EQUALS ||
    key === 'toJSON')
    throw new Error(`Cannot set ${path.map(String).join('.')}, ${key} is not a valid state property.`)

  return path
}

/******************************************************************************/
// State Change
/******************************************************************************/

function notifyStoreSubscribers (store, path) {

  const subs = reverse(store[SUBSCRIBERS])
  if (subs.length === 0)
    return

  let state = null

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
        state = state || store.toJSON()
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

  toJSON () {
    const state = {}

    for (const key in this) {
      const value = this[key]
      const isFunction = is.func(value)

      if (!isFunction)
        state[key] = copy.json(value)

      else if (TASK in value) {
        const { status } = value
        state[key] = { status }
      }
    }

    return state
  }

  [EQUALS] (input) {

    if (!is.object(input))
      return false

    for (const key in this) {
      const value = this[key]

      if (!is.func(value) || TASK in value)
        if (!equals(value, input[key]))
          return false
    }

    return true
  }

  get [Symbol.toStringTag] () {
    return 'Store'
  }

  constructor () {

    for (const property in this) {
      const method = this[property]

      // check if method has been decorated with TASK symbol
      if (is.func(method) && TASK in method) {

        // the property will hold the task constructor. Maybe in the future
        // different decorators could specify different constructors, or be
        // abstracted to 'Action' or something
        const Task = method[TASK]

        // if so, create a new task out of it
        Object.defineProperty(this, property, {
          writable: false,
          enumerable: true,
          configurable: false,
          value: new Task(this, property, method)
        })
      }
    }
  }

  set (path, value) {

    path = assertPath(this, path)

    const stateUnchanged = equals(get.mut(this, path), value)
    if (stateUnchanged)
      return false

    set.mut(this, path, value)
    notifyStoreSubscribers(this, path)

    return true
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

export { Store, SUBSCRIBERS }

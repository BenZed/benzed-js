import { equals } from '@benzed/immutable'

import { Store, SUBSCRIBERS } from './store'
import is from 'is-explicit'

// TODO
// Well, I built this fucking thing and I'm pretty sure I don't need it.

/******************************************************************************/
// Data
/******************************************************************************/

const STORE = Symbol('typeof-store')

const COUNT = Symbol('collection-size')

/******************************************************************************/
// Helper
/******************************************************************************/

const itemToJSON = item => item.toJSON()

function isValidKey (store, key) {
  return key !== 'count' &&
    key !== 'constructor' &&
    !is.func(store[key])
}

function assertKey (store, key) {
  if (!is.string(key) && !is.number(key))
    throw new Error('key must be a string or number')

  if (!isValidKey(store, key))
    throw new Error(`${String(key)} is an invalid key.`)
}

function assertIsStore (store) {
  if (!is(store, Store))
    throw new Error('must be an instance of Store')
}

function notifySubscribers (store) {

  for (const callback of store[SUBSCRIBERS])
    callback(store)

}

/******************************************************************************/
// Main
/******************************************************************************/

class StoreCollection {

  [STORE] = null;
  [SUBSCRIBERS] = [];
  [COUNT] = 0

  get count () {
    return this[COUNT]
  }

  get [Symbol.toStringTag] () {
    return 'StoreCollection'
  }

  constructor (store = Store) {
    if (!is.subclassOf(store, Store))
      throw new Error('Must be constructed with a subclass of Store')

    this[STORE] = store
  }

  get (key) {
    assertKey(this, key)

    return this[key]
  }

  has (key) {
    assertKey(this, key)

    return key in this
  }

  set (key, item) {

    assertIsStore(item)
    assertKey(this, key)

    if (key in this === false)
      this[COUNT] += 1

    this[key] = item

    notifySubscribers(this)

    return this
  }

  // batchSet (keyItems) {
  //
  // }

  delete (key) {

    if (key in this === false)
      return false

    this[COUNT] -= 1
    delete this[key]

    notifySubscribers(this)

    return true
  }
  //
  // batchDelete (keys) {
  //
  // }

  subscribe (callback) {
    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    this[SUBSCRIBERS].push(callback)
    return this
  }

  unsubscribe (callback) {
    if (!is.func(callback))
      throw new Error('callback argument must be a function')

    const subs = this[SUBSCRIBERS]

    let count = 0
    for (let i = subs.length - 1; i >= 0; i--)
      if (equals(subs[i], callback)) {
        subs.splice(i, 1)
        count++
      }

    return count
  }

  * keys () {

    const { getOwnPropertyNames } = Object

    for (const key of getOwnPropertyNames(this))
      if (isValidKey(this, key))
        yield key
  }

  * values () {

    for (const key of this.keys())
      yield this[key]

  }

  * entries () {

    for (const key of this.keys())
      yield [ key, this[key] ]

  }

  * [Symbol.iterator] () {
    for (const entry of this.entries())
      yield entry
  }

  clear () {

    const keys = [ ...this.keys() ]

    const alreadyClear = keys.length === 0
    if (alreadyClear)
      return

    for (const key of keys)
      delete this[key]

    this[COUNT] = 0

    notifySubscribers(this)
  }

  toJSON () {

    return [ ...this.values() ].map(itemToJSON)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default StoreCollection

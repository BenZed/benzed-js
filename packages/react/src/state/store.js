import { get, set } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const SUBSCRIBERS = Symbol('subscribers')

function notifySubscribers (store, path) {

  const value = store.get(path)

  for (const subscriber of store[SUBSCRIBERS]) {

    const { func, path: fPath } = subscriber



  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class Store {

  [SUBSCRIBERS] = []

  set (path, value) {
    set(this, path, value)

    notifySubscribers(this, path)
  }

  get (path) {
    return get(this, path)
  }

  subscribe (func, path) {
    this[SUBSCRIBERS].push({ func, path })
  }

  unsubscribe (func) {

    this[SUBSCRIBERS] = this[SUBSCRIBERS].filter(obj => obj.func !== func)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

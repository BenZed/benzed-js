import isClient from './is-client'

/******************************************************************************/
// MapStorage
/******************************************************************************/

const $$store = Symbol('object-used-to-store')

class JSONStorage {

  constructor (storage) {
    this[$$store] = storage || new Map()
  }

  [$$store] = null

  get isMapStorage () {

    const store = this[$$store]

    return store instanceof Map
  }

  getItem (key) {
    const store = this[$$store]

    const value = this.isMapStorage
      ? store.get(key)
      : store.getItem(key)

    try {
      return value === undefined
        ? value
        : JSON.parse(value)
    } catch (e) {
      e.name = 'ParseJsonError'
      console.warn(e)
      return null
    }

  }

  setItem (key, value) {
    const store = this[$$store]

    const str = JSON.stringify(value)

    if (this.isMapStorage)
      store.set(key, str)
    else
      store.setItem(key, str)

  }

  removeItem (key) {
    const store = this[$$store]

    if (this.isMapStorage)
      store.delete(key)
    else
      store.removeItem(key)
  }

  clear () {
    const store = this[$$store]

    store.clear()
  }

  key (i) {
    const store = this[$$store]
    return this.isMapStorage
      ? [ ...store.keys() ][i]
      : store.key(i)
  }

  get length () {
    const store = this[$$store]

    return this.isMapStorage
      ? store.size
      : store.length
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const storage = {
  local: new JSONStorage(isClient() && window.localStorage),
  session: new JSONStorage(isClient() && window.sessionStorage)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default storage

export { JSONStorage }

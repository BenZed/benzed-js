import isClient from './is-client'

/******************************************************************************/
// MapStorage
/******************************************************************************/

const STORE = Symbol('object-used-to-store')

class JSONStorage {

  constructor (storage) {
    this[STORE] = storage || new Map()
  }

  [STORE] = null

  get isMapStorage () {

    const store = this[STORE]

    return store instanceof Map
  }

  getItem (key) {
    const store = this[STORE]

    const value = this.isMapStorage
      ? store.get(key)
      : store.getItem(key)

    try {
      return JSON.parse(value)
    } catch (e) {
      e.name = 'ParseJsonError'
      console.warn(e)
      return null
    }

  }

  setItem (key, value) {
    const store = this[STORE]

    const str = JSON.stringify(value)

    if (this.isMapStorage)
      store.set(key, str)
    else
      store.setItem(key, str)

  }

  removeItem (key) {
    const store = this[STORE]

    if (this.isMapStorage)
      store.delete(key)
    else
      store.removeItem(key)
  }

  clear () {
    const store = this[STORE]

    store.clear()
  }

  get length () {
    const store = this[STORE]

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

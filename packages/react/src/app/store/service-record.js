import Store from '../../store/store'
import is from 'is-explicit'

import { wrap } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

class ServiceRecord extends Store {

  // state

  data = { }

  status = 'unfetched'

  // construct

  constructor (id, store) {

    super()

    if (!is(id, [String, Number]))
      throw new Error(`${this.constructor.name} must be instantiated with an id`)

    Object.defineProperties(this, {
      id: { value: id, enumerable: true },
      _id: { value: id },
      store: { value: store, enumerable: true }
    })

    if (!is.object(store))
      throw new Error(`${this.constructor.name} must be instantiated with a store`)

  }

  getError (path) {
    path = wrap(path)

    return this.get([ 'data', 'errors', ...path ])
  }

  getDb (path) {
    path = wrap(path)

    return this.get([ 'data', 'db', ...path ])
  }

  getData (path) {
    path = wrap(path)

    let value = this.get([ 'data', 'live', ...path ])
    if (value === undefined)
      value = this.get([ 'data', 'db', ...path ])

    return value
  }

  setLive (path, value) {
    throw new Error('not yet implemented')
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceRecord

import { COPY } from '@benzed/immutable'
import { wrap } from '@benzed/array'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

class Context {

  path = null
  data = null
  value = null

  constructor (path, value, data) {
    this.path = wrap(path).filter(is.defined)
    this.value = value
    this.data = data
  }

  push (key) {

    const context = this[COPY]()

    context.path = [ ...context.path, key ]

    return context
  }

  [COPY] () {

    const context = new this.constructor(
      this.path,
      this.value,
      this.data
    )

    return context
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Context

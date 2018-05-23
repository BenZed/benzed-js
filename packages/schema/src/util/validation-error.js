import { wrap } from '@benzed/array'
import is from 'is-explicit'

/******************************************************************************/
// Message Property Descriptor
/******************************************************************************/

const message = {

  get () {
    let pathStr = this.path.join('.')
    if (pathStr.length > 0)
      pathStr += ' '

    return `${pathStr}${this.rawMessage}`
  },

  set (value) {
    this.rawMessage = value
  },

  enumerable: true,
  configurable: false
}

/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  constructor (path, msg = 'Validation failed.', isInvalidType = false) {
    super(msg)

    this.name = 'ValidationError'
    this.path = is.defined(path) ? wrap(path) : []
    this.isInvalidType = isInvalidType
    this.rawMessage = this.message

    Object.defineProperty(this, 'message', message)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

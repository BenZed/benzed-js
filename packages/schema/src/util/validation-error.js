import { wrap } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  constructor (path, msg = 'Validation failed.', isTypeError = false) {
    path = wrap(path || '<input>')

    let pathStr = path.join('.')
    if (pathStr.length > 0)
      pathStr += ' '

    super(`${pathStr}${msg}`)
    this.name = 'ValidationError'
    this.path = path
    this.isTypeError = isTypeError
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

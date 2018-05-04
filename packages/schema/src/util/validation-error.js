import { wrap } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  constructor (path, msg = 'Validation failed.') {
    path = wrap(path || '<input>')

    let pathStr = path.join('.')
    if (pathStr.length > 0)
      pathStr += ' '

    super(`${pathStr}${msg}`)
    this.name = 'ValidationError'
    this.path = path
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

import { wrap } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  constructor (path, msg = 'Validation failed.') {
    path = wrap(path || '')
    super(`${path.join('.')} ${msg}`)
    this.name = 'ValidationError'
    this.path = path
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

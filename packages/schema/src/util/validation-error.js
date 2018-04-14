
/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  constructor (path, msg = 'Validation failed.') {
    super(msg)
    this.name = 'ValidationError'
    this.path = path
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

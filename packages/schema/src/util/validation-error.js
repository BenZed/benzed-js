
/******************************************************************************/
// Main
/******************************************************************************/

class ValidationError extends Error {

  name = 'ValidationError'
  path = null

  rawMessage = null

  get message () {

    const { path, rawMessage } = this
    const prefix = path.length === 0
      ? path.join('.') + ' '
      : ''

    return `${prefix}${rawMessage}`
  }

  constructor (rawMessage, value, path) {
    super()

    this.path = [ ...(path || []) ]
    this.value = value
    this.rawMessage = rawMessage
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValidationError

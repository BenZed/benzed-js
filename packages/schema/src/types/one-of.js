import { TYPE, TypeValidationError, argsToConfig } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

const oneOfTypeConfig = argsToConfig([
  {
    name: 'values',
    type: Array
  },
  {
    name: 'err',
    type: String
  }
])

/******************************************************************************/
// Main
/******************************************************************************/

function oneOf (...args) {

  const config = oneOfTypeConfig(args)

  const { values } = config
  let { err } = config

  err = err || `Must be one of: ${values}`

  const oneOf = value => {

    if (value == null)
      return value

    return values.includes(value)
      ? value
      : new TypeValidationError(err)
  }

  oneOf[TYPE] = 'Enumeration'

  return oneOf
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOf

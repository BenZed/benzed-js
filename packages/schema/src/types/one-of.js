import Context from '../util/context'
import argsToConfig from '../util/args-to-config'
import ValidationError from '../util/validation-error'
import { TYPE } from '../util/symbols'

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

  const oneOf = (value, context = new Context()) => {

    if (value == null)
      return value

    return values.includes(value)
      ? value
      : new ValidationError(context.path, err, true)
  }

  oneOf[TYPE] = 'Enumeration'

  return oneOf
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOf

import Context from '../util/context'
import argsToConfig from '../util/args-to-config'
import ValidationError from '../util/validation-error'
import { TYPE } from '../util/symbols'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const oneOfTypeConfig = argsToConfig([
  {
    name: 'values',
    test: Array::is
  },
  {
    name: 'err',
    test: is.string
  }
])

/******************************************************************************/
// Main
/******************************************************************************/

function oneOf (...args) {

  const config = oneOfTypeConfig(args)

  const { values } = config
  let { err } = config

  err = err || `Must be one of: ${values.join(', ')}`

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

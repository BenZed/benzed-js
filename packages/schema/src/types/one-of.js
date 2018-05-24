import validate from '../util/validate'
import ValidationError from '../util/validation-error'

import { enumTypeConfig } from '../util/type-config'
import { TYPE } from '../util/symbols'

import Context from '../util/context'

/******************************************************************************/
// Main
/******************************************************************************/

function oneOf (...args) {

  const config = enumTypeConfig(args)

  const { cast, validators, values } = config
  let { err } = config

  err = config.err || `Must be one of: ${values.join(', ')}`

  const oneOf = (value, context = new Context()) => {

    if (cast && value != null && !values.includes(value))
      value = cast(value)

    if (value != null && !values.includes(value))
      return new ValidationError(context.path, err, true)

    return validators && validators.length > 0
      ? validate(validators, value, context.safe())
      : value
  }

  oneOf[TYPE] = 'Enumeration'

  return oneOf
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOf

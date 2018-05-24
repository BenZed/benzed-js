import is from 'is-explicit'

import validate from '../util/validate'
import ValidationError from '../util/validation-error'

import { typeConfig, getTypeName } from '../util/type-config'
import { TYPE } from '../util/symbols'

import Context from '../util/context'

/******************************************************************************/
// Main
/******************************************************************************/

function typeOf (...args) {

  const config = typeConfig(args)

  // I had originally written this function so that this was possible, but
  // it really should never be the case
  if (TYPE in config.type)
    throw new Error('Cannot nest type functions in typeOf')

  const typeName = getTypeName(config.type)

  config.err = config.err || `Must be of type: ${typeName}`

  const typeOf = (value, context = new Context()) => {

    const { cast, type, err, validators } = config

    if (cast && value != null && !is(value, type))
      value = cast(value)

    if (value != null && !is(value, type))
      return new ValidationError(context.path, err, true)

    return validators && validators.length > 0
      ? validate(validators, value, context.safe())
      : value

  }

  typeOf[TYPE] = typeName

  return typeOf

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default typeOf

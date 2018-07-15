import validate from '../util/validate'
import normalizeValidator from '../util/normalize-validator'
import ValidationError from '../util/validation-error'
import Context from '../util/context'
import { getTypeName, multiTypeConfig } from '../util/type-config'
import { TYPE } from '../util/symbols'

import typeOf from './type-of'
import is from 'is-explicit'

/******************************************************************************/
// Configure
/******************************************************************************/

const oneOfTypeName = types => {

  const names = types.map(getTypeName)

  if (names.length === 1)
    return names[0]

  const last = names.pop()

  return `${names.join(', ')} or ${last}`

}

/******************************************************************************/
// Helper
/******************************************************************************/

function setupTypes ({ types, err, cast }) {

  for (let i = 0; i < types.length; i++) {
    let type = types[i]
    type = normalizeValidator(type)
    type = TYPE in type ? type : typeOf(type)

    types[i] = type
  }

  return types

}

function validateOneOfType (value, context, config, index = 0, oneSuccess = false) {

  const { types, validators } = config

  const safeContext = context.safe()

  for (let i = index; i < types.length; i++) {
    const type = types[i]

    const result = validate(type, value, safeContext)
    if (is(result, Error))
      continue

    if (is(result, Promise))
      return result.then(resolvedValue => {
        const isError = is(resolvedValue, Error)
        validateOneOfType(
          isError ? value : resolvedValue,
          context,
          config,
          isError ? index + 1 : types.length,
          !isError
        )
      })

    oneSuccess = true
    value = result
    break

  }

  if (!oneSuccess)
    return new ValidationError(context.path, config.err, true)

  return validators && validators.length > 0
    ? validate(value, validators, context.safe())
    : value
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * oneOfType - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
function oneOfType (...args) {

  const config = multiTypeConfig(args)

  config.types = setupTypes(config)

  const typeNames = oneOfTypeName(config.types)

  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be either: ${typeNames}`

  const oneOfType = (value, context = new Context()) => validateOneOfType(value, context, config)

  oneOfType[TYPE] = typeNames

  return oneOfType
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOfType

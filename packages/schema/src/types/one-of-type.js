import {
  argsToConfig, normalizeValidator,
  TYPE

} from '../util'

import typeOf, { getTypeName, isType } from './type-of'
import is from 'is-explicit'
import validate from '../validate'

/******************************************************************************/
// Configure
/******************************************************************************/

const multiTypeConfig = argsToConfig([
  {
    name: 'types',
    type: Function,
    count: Infinity
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'validators',
    type: Function,
    count: Infinity
  },
  {
    name: 'cast',
    type: Function
  }
])

/******************************************************************************/
// Helper
/******************************************************************************/

// function isOneOfType (value, types) {
//   for (const type of types) {
//
//     if (is(value, type))
//       return true
//   }
//
//   return false
// }

// function castToOneOfType (value, cast, types) {
//
//   if (cast)
//     return cast(value)
//
//   for (const type of types) {
//
//     if (TYPE in type === false)
//       continue
//
//     const result = type(value)
//     if (isType(result, type))
//       return result
//
//   }
//
//   return value
// }

function setupTypes ({ types, err, cast }) {

  for (let i = 0; i < types.length; i++) {
    let type = types[i]
    type = normalizeValidator(type)
    type = typeOf({ type, err, cast })

    types[i] = type
  }

  return types
}

function validateOneOfType (value, context, config, index = 0) {

  const { types, validators } = config

  const safeContext = context.safe()

  for (let i = index; i < types.length; i++) {
    const type = types[i]

    const result = validate(type, value, safeContext)
    // console.log({ value, result })
    if (is(result, Error))
      continue

    if (is(result, Promise))
      return result.then(resolvedValue => {
        const isError = is(resolvedValue, Error)
        validateOneOfType(
          isError ? value : resolvedValue,
          context,
          config,
          isError ? index + 1 : types.length
        )
      })

    value = result

    if (isType(value, type))
      break
  }

  return validators && validators.length > 0
    ? validate(value, validators, context.safe())
    : value
}

/******************************************************************************/
// Main
/******************************************************************************/

function oneOfType (...args) {

  const config = multiTypeConfig(args)

  config.types = setupTypes(config)
  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be either: ${getTypeName(config.types)}`

  const oneOfType = (value, context) => validateOneOfType(value, context, config)

  oneOfType[TYPE] = config.types

  return oneOfType
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOfType

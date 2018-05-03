import {
  argsToConfig, normalizeValidator,
  TYPE, TYPE_TEST_ONLY

} from '../util'

import { isType, getTypeName } from './type-of'

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

function isOneOfType (value, types) {
  for (const type of types)
    if (isType(value, type))
      return true

  return false
}

function castToOneOfType (value, cast, types) {

  if (cast)
    return cast(value)

  for (const type of types) {

    if (TYPE in type === false)
      continue

    const result = type(value)
    if (isType(result, type))
      return result

  }

  return value
}

/******************************************************************************/
// Main
/******************************************************************************/

function oneOfType (...args) {

  const config = multiTypeConfig(args)
  const { err, cast } = config

  // Because arrayOf can use other type functions, this is an elegant way
  // to reduce methods that have OPTIONAL_CONFIG enabled
  const types = config.types.map(normalizeValidator)

  const typeNames = `either: ${getTypeName(types)}`

  const oneOfType = (value, context) => {

    const testOnly = context === TYPE_TEST_ONLY

    const testResult = value == null || isOneOfType(value, types)
    if (testOnly)
      return testResult

    if (testResult)
      return value

    value = castToOneOfType(value, cast, types)

    return !isOneOfType(value, types)
      ? new Error(err || `Must be ${typeNames}`)
      : value

  }

  oneOfType[TYPE] = typeNames

  return oneOfType
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default oneOfType

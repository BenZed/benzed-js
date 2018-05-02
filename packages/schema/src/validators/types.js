import is from 'is-explicit'
import { argsToConfig, normalizeDefinition, OPTIONAL_CONFIG } from '../util'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

const layout = [
  {
    name: 'type',
    type: Function
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'cast',
    type: Function
  }
]

const configGeneric = argsToConfig(layout)

const configSpecific = argsToConfig(layout.slice(1))

const configMulti = argsToConfig([
  {
    name: 'types',
    type: Function,
    count: Infinity
  },
  layout[1],
  layout[2]
])

// For default errors with multiple types

const ERR_DELIMITER = ' or '

/******************************************************************************/
// Nestable Type Helpers
/******************************************************************************/

const IS_TYPE_FUNC = Symbol('is-type-validator')

const TEST_ONLY = Symbol('skip-cast-in-type-validator')

function getTypeName (type) {

  if (type instanceof Array)
    return type.map(getTypeName).join(ERR_DELIMITER)

  return type[IS_TYPE_FUNC]
    ? type[IS_TYPE_FUNC]
    : type.name

}

function isType (value, type) {

  if (IS_TYPE_FUNC in type)
    return type(value, TEST_ONLY)

  else
    return is(value, type)

}

function castToType (value, cast, type) {

  return cast
    ? cast(value)
    : IS_TYPE_FUNC in type
      ? type(value)
      : value

}

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

    if (IS_TYPE_FUNC in type === false)
      continue

    const result = type(value)
    if (isType(result, type))
      return result

  }

  return value
}
/******************************************************************************/
// Generic
/******************************************************************************/

function typeOf (...args) {

  const config = configGeneric(args)
  const { err, cast } = config

  const [ type ] = normalizeDefinition(config.type)

  const typeName = getTypeName(type)

  const func = (value, context) => {

    const testOnly = context === TEST_ONLY

    const testResult = value == null || isType(value, type)
    if (testOnly)
      return testResult

    if (testResult)
      return value

    value = castToType(value, cast, type)

    return !isType(value, type)
      ? new Error(
        err ||
        `Must be of type: ${typeName}`
      )

      : value
  }

  func[IS_TYPE_FUNC] = typeName

  return func

}

/******************************************************************************/
// String
/******************************************************************************/

const toString = value => {

  if (is(value, Object) &&
      is(value.toString, Function) &&
      value.toString !== Object.prototype.toString)

    return value.toString()

  if (is(value, Boolean, Number))
    return `${value}`

  return value

}

function string (...args) {

  const config = configSpecific(args)

  config.type = String
  config.cast = config.cast || toString

  return typeOf(config)
}
string[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Number
/******************************************************************************/

function number (...args) {

  const config = configSpecific(args)

  config.type = Number
  config.cast = config.cast || Number

  return typeOf(config)
}
number[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Boolean
/******************************************************************************/

const toBoolean = value => {

  if (is(value, String))
    return /^true$/i.test(value)
      ? true
      : /^false$/i.test(value)
        ? false
        : value

  if (is(value, Number))
    return value === 1
      ? true
      : value === 0
        ? false
        : value

  if (is(value, Object) && is(value.valueOf, Function))
    value = value.valueOf()

  return value
}

function bool (...args) {
  const config = configSpecific(args)

  config.type = Boolean
  config.cast = config.cast || toBoolean

  return typeOf(config)
}

bool[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Object
/******************************************************************************/

function object (...args) {

  const config = configSpecific(args)

  config.type = Object

  return typeOf(config)
}

object[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Function
/******************************************************************************/

function func (...args) {

  const config = configSpecific(args)

  config.type = Function

  return typeOf(config)
}

func[OPTIONAL_CONFIG] = true

/******************************************************************************/
// arrayOf
/******************************************************************************/

function arrayOf (...args) {

  const config = configGeneric(args)
  const { err, cast } = config

  // Because arrayOf can use other type functions, this is an elegant way
  // to reduce methods that have OPTIONAL_CONFIG enabled
  const [ type ] = normalizeDefinition(config.type)

  const typeName = `Array of ${getTypeName(type)}s`

  const func = (array, context) => {

    const testOnly = context === TEST_ONLY

    array = wrap(array)

    for (let i = 0; i < array.length; i++) {
      let value = array[i]

      if (isType(value, type))
        continue

      value = castToType(value, cast, type)

      if (!isType(value, type))
        return testOnly
          ? false
          : new Error(
            err ||
            `Must be an ${typeName}`
          )
      else
        array[i] = value
    }

    return testOnly ? true : array
  }

  func[IS_TYPE_FUNC] = typeName

  return func

}

/******************************************************************************/
// one of type
/******************************************************************************/

function oneOfType (...args) {

  const config = configMulti(args)
  const { err, cast } = config

  const types = normalizeDefinition(config.types)

  const typeNames = `one of type: ${getTypeName(types)}`

  const func = (value, context) => {

    const testOnly = context === TEST_ONLY

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

  func[IS_TYPE_FUNC] = typeNames

  return func
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default typeOf

export {
  string, number, bool, object, func, typeOf as instanceOf,
  arrayOf, oneOfType
}

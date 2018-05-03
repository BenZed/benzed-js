import is from 'is-explicit'

import argsToConfig from '../util/args-to-config'
import normalizeValidator from '../util/normalize-validator'
import {
  TYPE, TYPE_TEST_ONLY
} from '../util/symbols'

import validate from '../validate'

/******************************************************************************/
// Config
/******************************************************************************/

const layout = [
  {
    name: 'type',
    type: Function,
    required: true
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'validators',
    type: Function,
    count: Infinity,
    default: [],
    validate: normalizeValidator
  },
  {
    name: 'cast',
    type: Function
  }
]

const typeConfig = argsToConfig(layout)

const specificTypeConfig = argsToConfig(layout.slice(1))

/******************************************************************************/
// Helper
/******************************************************************************/

function getTypeName (type) {

  if (type instanceof Array) {
    const last = type.pop()
    return type.map(getTypeName).join(', ') + ' or ' + getTypeName(last)
  }

  return type[TYPE]
    ? type[TYPE]
    : type.name

}

function isType (value, Type) {

  if (TYPE in Type)
    return Type(value, TYPE_TEST_ONLY)

  else
    return is(value, Type)

}

function castToType (value, cast, Type) {

  return cast
    ? cast(value)
    : TYPE in Type
      ? Type(value)
      : value
}

/******************************************************************************/
// Main
/******************************************************************************/

function typeOf (...args) {

  const config = typeConfig(args)

  const { err, cast, validators } = config

  // Because typeOf can use other type functions, this is an elegant way
  // to reduce methods that have OPTIONAL_CONFIG enabled
  const Type = normalizeValidator(config.type)

  const typeName = getTypeName(Type)

  const typeOf = (value, context) => {

    const testOnly = context === TYPE_TEST_ONLY

    const testResult = value == null || isType(value, Type)
    if (testOnly)
      return testResult

    if (!testResult) {

      value = castToType(value, cast, Type)

      if (!isType(value, Type))
        return new Error(
          err || `Must be of type: ${typeName}`
        )
    }

    return validators && validators.length > 0
      ? validate(validators, value, context)
      : value
  }

  typeOf[TYPE] = typeName

  return typeOf

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default typeOf

export { typeConfig, specificTypeConfig, isType, castToType, getTypeName }

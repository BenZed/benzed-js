import is from 'is-explicit'

import argsToConfig from '../util/args-to-config'
import reduceValidator from '../util/reduce-validator'
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
    type: Function
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'validators',
    type: Function,
    count: Infinity,
    default: []
  },
  {
    name: 'cast',
    type: Function
  }
]

const typeConfig = argsToConfig(layout)

const specificTypeConfig = argsToConfig(layout.slice(1))

const ERR_DELIMITER = ' or '

/******************************************************************************/
// Helper
/******************************************************************************/

function getTypeName (type) {

  if (type instanceof Array)
    return type.map(getTypeName).join(ERR_DELIMITER)

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

function normalizeValidators (validators) {

  validators = validators.map(reduceValidator)

  return validators

}

/******************************************************************************/
// Main
/******************************************************************************/

function typeOf (...args) {

  const config = typeConfig(args)

  const { err, cast } = config

  // Because typeOf can use other type functions, this is an elegant way
  // to reduce methods that have OPTIONAL_CONFIG enabled
  const Type = reduceValidator(config.type)

  const validators = normalizeValidators(config.validators)

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

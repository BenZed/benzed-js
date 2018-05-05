import is from 'is-explicit'

import argsToConfig from '../util/args-to-config'
import reduceValidator from '../util/reduce-validator'
import TypeValidationError from '../util/type-validation-error'

import { TYPE } from '../util/symbols'

import validate from '../validate'

/******************************************************************************/
// Config
/******************************************************************************/

const layout = [
  {
    name: 'type',
    type: Function,
    required: true,
    validate: reduceValidator
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
    validate: reduceValidator
  },
  {
    name: 'cast',
    type: Function
  }
]

const typeConfig = argsToConfig(layout)

const arrayTypeConfig = argsToConfig(layout.slice(0, 3))

const anyTypeConfig = argsToConfig(layout.slice(1, 3))

const specificTypeConfig = argsToConfig(layout.slice(1))

/******************************************************************************/
// Helper
/******************************************************************************/

function getTypeName (type) {

  return type[TYPE] || type.name

}

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

  const typeOf = (value, context) => {

    const { cast, type, err, validators } = config

    if (cast && value != null && !is(value, type))
      value = cast(value)

    if (value != null && !is(value, type))
      return new TypeValidationError(err)

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

export {
  typeConfig,
  anyTypeConfig,
  specificTypeConfig,
  arrayTypeConfig,
  getTypeName
}

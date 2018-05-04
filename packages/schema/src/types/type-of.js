import is from 'is-explicit'

import argsToConfig from '../util/args-to-config'
import normalizeValidator from '../util/normalize-validator'
import { TYPE } from '../util/symbols'

import validate from '../validate'

import { wrap } from '@benzed/array'

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

function getRootType (type) {
  while (TYPE in type)
    type = type[TYPE]

  return type
}

function isType (value, type) {

  const rootType = getRootType(type)
  return rootType instanceof Array
    ? is(value, ...rootType)
    : is(value, rootType)

}

function getTypeName (type) {

  let rootType = getRootType(type)

  if (rootType instanceof Array) {
    rootType = [ ...rootType ]
    const last = rootType.pop()
    return rootType.map(getTypeName).join(', ') + ' or ' + getTypeName(last)
  }

  return rootType.name

}

function validateType (value, context, config, skipSelf = false) {

  const { type, err, cast, validators } = config

  const rootType = getRootType(type)

  const isTypeValidator = TYPE in type
  if (isTypeValidator && !skipSelf) {
    const result = validate(type, value, context.safe())
    if (isType(result, rootType) || is(result, Promise))
      value = result
  }

  console.log('TYPEOF', { value, type: getTypeName(type) })

  if (is(value, Error))
    return value

  if (is(value, Promise))
    return value
      .then(resolvedValue => validateType(resolvedValue, context, config, true))

  if (value != null) {
    if (!isType(value, rootType) && cast)
      value = cast(value)

    if (!isType(value, rootType))
      return new Error(err)
  }

  return validators && validators.length > 0
    ? validate(validators, value, context)
    : value

}

/******************************************************************************/
// Main
/******************************************************************************/

function typeOf (...args) {

  const config = typeConfig(args)

  config.type = normalizeValidator(config.type)
  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be of type: ${getTypeName(config.type)}`

  const typeOf = (value, context) => validateType(value, context, config)

  typeOf[TYPE] = config.type

  return typeOf

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default typeOf

export { typeConfig, specificTypeConfig, getTypeName, isType }

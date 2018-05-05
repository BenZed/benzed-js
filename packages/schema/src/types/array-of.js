import { wrap } from '@benzed/array'
import is from 'is-explicit'

import normalizeValidator from '../util/normalize-validator'
import TypeValidationError from '../util/type-validation-error'
import validate from '../validate'

import { TYPE } from '../util'

import typeOf, { arrayTypeConfig, getTypeName } from './type-of'

/******************************************************************************/
// Helpers
/******************************************************************************/

const arrayTypeName = type => `Array of ${getTypeName(type)}`

function firstErrorOrArray (array) {
  for (const item of array)
    if (is(item, Error))
      return item

  return array
}

function handleError (err, msg) {
  return is(err, TypeValidationError)
    ? new TypeValidationError(msg)
    : err
}

function validateArrayOf (array, context, config, skipItems = false) {

  const { validators, err, type } = config

  array = wrap(array)
  let async = false

  if (!skipItems) for (let i = 0; i < array.length; i++) {
    let value = array[i]
    value = validate(type, value, context.safe())

    if (is(value, Error))
      return handleError(value, err)

    if (is(value, Promise))
      async = true

    array[i] = value
  }

  if (async)
    return Promise
      .all(array)
      .then(firstErrorOrArray)
      .then(arr => arr instanceof Error
        ? handleError(arr, err)
        : validateArrayOf(arr, context, config, true)
      )

  return validators && validators.length > 0
    ? validate(validators, array, context.safe())
    : array
}

/******************************************************************************/
// arrayOf
/******************************************************************************/

function arrayOf (...args) {

  const config = arrayTypeConfig(args, 'arrayOf')

  // Because arrayOf can use other type functions, this is an elegant way to
  // reduce methods that have OPTIONAL_CONFIG enabled
  config.type = normalizeValidator(config.type)
  config.validators = config.validators.map(normalizeValidator)

  const typeName = arrayTypeName(config.type)

  config.err = config.err || `Must be an ${typeName}`

  // Nest the type inside a typeof validator with potentially overriding err and
  // cast configs
  config.type = TYPE in config.type
    ? config.type
    : typeOf(config.type)

  const arrayOf = (array, context) => validateArrayOf(array, context, config)

  arrayOf[TYPE] = typeName

  return arrayOf

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default arrayOf

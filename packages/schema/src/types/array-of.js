import { wrap } from '@benzed/array'
import is from 'is-explicit'

import normalizeValidator from '../util/normalize-validator'
import validate from '../validate'

import { TYPE } from '../util'

import typeOf, { typeConfig, getTypeName } from './type-of'

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

function validateArrayOf (array, context, config, skipSelf = false) {

  const { validators, type } = config

  array = wrap(array)

  if (!skipSelf)
    array = validate(validators, array, context.safe())

  if (is(array, Error))
    return array

  if (!skipSelf && is(array, Promise))
    return array
      .then(resolvedArray => validateArrayOf(resolvedArray, context, config, true))

  let async = false

  for (let i = 0; i < array.length; i++) {
    let value = array[i]

    value = validate(type, value, context.safe())
    console.log('ARRAYOF', { i, value })

    if (is(value, Error))
      return value

    if (is(value, Promise))
      async = true

    array[i] = value
  }

  return async
    ? Promise
      .all(array)
      .then(firstErrorOrArray)
    : array
}

/******************************************************************************/
// arrayOf
/******************************************************************************/

function arrayOf (...args) {

  const config = typeConfig(args, 'arrayOf')

  // Because arrayOf can use other type functions, this is an elegant way to
  // reduce methods that have OPTIONAL_CONFIG enabled
  config.type = normalizeValidator(config.type)
  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be an ${arrayTypeName(config.type)}`

  // Nest the type inside a typeof validator with potentially overriding err and
  // cast configs
  config.type = typeOf({
    type: config.type,
    err: config.err,
    cast: config.cast
  })

  const arrayOf = (array, context) => validateArrayOf(array, context, config)

  arrayOf[TYPE] = config.type

  return arrayOf

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default arrayOf

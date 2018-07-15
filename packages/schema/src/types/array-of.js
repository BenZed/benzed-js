import { wrap } from '@benzed/array'
import is from 'is-explicit'

import ValidationError from '../util/validation-error'
import { getTypeName, arrayTypeConfig } from '../util/type-config'
import validate from '../util/validate'
import { TYPE } from '../util/symbols'
import Context from '../util/context'

import typeOf from './type-of'

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

function handleError (err, msg, context) {
  return err.isInvalidType
    ? new ValidationError(context.path, msg, true)
    : err
}

function validateArrayOf (array, context, config, skipItems = false) {

  const { validators, err, type } = config

  if (array != null)
    array = wrap(array)

  let async = false

  if (!skipItems && array) for (let i = 0; i < array.length; i++) {
    let value = array[i]
    value = validate(type, value, context.safe())

    if (is(value, Error))
      return handleError(value, err, context)

    if (is(value, Promise))
      async = true

    array[i] = value
  }

  if (async)
    return Promise
      .all(array)
      .then(firstErrorOrArray)
      .then(arr => arr instanceof Error
        ? handleError(arr, err, context)
        : validateArrayOf(arr, context, config, true)
      )

  return validators && validators.length > 0
    ? validate(validators, array, context.safe())
    : array
}

/******************************************************************************/
// arrayOf
/******************************************************************************/

/**
 * arrayOf - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
function arrayOf (...args) {

  const config = arrayTypeConfig(args, 'arrayOf')

  const typeName = arrayTypeName(config.type)

  config.err = config.err || `Must be an ${typeName}`

  // Nest the type inside a typeof validator with potentially overriding err and
  // cast configs
  config.type = TYPE in config.type
    ? config.type
    : typeOf(config.type)

  const arrayOf = (array, context = new Context()) =>
    validateArrayOf(array, context, config)

  arrayOf[TYPE] = typeName

  return arrayOf

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default arrayOf

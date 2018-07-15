import { OPTIONAL_CONFIG, TYPE } from '../util/symbols'
import normalizeValidator from '../util/normalize-validator'
import ValidationError from '../util/validation-error'
import validate from '../util/validate'
import Context from '../util/context'

import { objectConfig } from '../util/type-config'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function normalizeShape (shape) {

  if (shape) for (const key in shape)
    shape[key] = normalizeValidator(shape[key])

  if (shape && Object.keys(shape).length === 0)
    throw new Error('object config \'shape\' property requires at least one key')

  return shape
}

/******************************************************************************/
// Validate Shape
/******************************************************************************/

function validateShape (shape, obj, context, shapeKeysOnly) {

  let async

  if (shapeKeysOnly) for (const key in obj)
    if (key in shape === false)
      delete obj[key]

  for (const key in shape) {

    const result = validate(shape[key], obj[key], context.push(key))

    if (is(result, Promise)) {
      async = async || { keys: [], promises: [] }
      async.keys.push(key)
      async.promises.push(result)
    }

    if (is(result, Error))
      return result

    if (result !== undefined)
      obj[key] = result

  }

  if (!async)
    return obj

  return Promise
    .all(async.promises)
    .then(results => {

      for (let i = 0; i < results.length; i++) {
        const key = async.keys[i]
        const result = results[i]

        if (is(result, Error))
          return result

        obj[key] = result
      }

      return obj
    })

}

function validateObject (value, context, config, skipSelf = false) {

  const { cast, shape, err, validators, shapeKeysOnly } = config

  if (!skipSelf && value != null && cast && !is.plainObject(value))
    value = cast(value)

  if (!skipSelf && validators && validators.length > 0)
    value = validate(validators, value, context.safe())

  if (is(value, Error))
    return value

  if (is(value, Promise))
    return value.then(resolved => validateObject(resolved, context, config, true))

  if (!skipSelf && value != null && !is.plainObject(value))
    return new ValidationError(context.path, err, true)

  if (value != null && shape)
    value = validateShape(shape, value, context, shapeKeysOnly)

  return value
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * object - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
function object (...args) {

  const config = objectConfig(args)

  config.shape = normalizeShape(config.shape)
  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be an Object`

  if (config.shapeKeysOnly === undefined)
    config.shapeKeysOnly = !!config.shape

  const object = (value, context = new Context()) => validateObject(value, context, config)

  object[TYPE] = 'Object'

  return object
}

object[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default object

export { normalizeValidator }

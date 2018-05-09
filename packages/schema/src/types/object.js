import { OPTIONAL_CONFIG, TYPE } from '../util/symbols'
import argsToConfig from '../util/args-to-config'
import normalizeValidator from '../util/normalize-validator'
import TypeValidationError from '../util/type-validation-error'

import validate from '../validate'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const layout = [
  {
    name: 'shape',
    type: Object,
    default: null
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
  },

  {
    name: 'onlyShapeKeys',
    type: Boolean
  }
]

const objectConfig = argsToConfig(layout)

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

function validateShape (shape, obj, context, onlyShapeKeys) {

  let async

  if (onlyShapeKeys) for (const key in obj)
    if (key in shape === false)
      delete obj[key]

  for (const key in shape) {

    const result = validate(shape[key], obj[key], context.push(key))

    if (is(result, Promise)) {
      async = async || { keys: [], promises: [] }
      async.keys.push(key)
      async.promises.push(result)

    } else if (result !== undefined)
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

  const { cast, shape, err, validators, onlyShapeKeys } = config

  if (!skipSelf && cast && value != null && !is.plainObject(value))
    value = cast(value)

  if (!skipSelf && value != null && !is.plainObject(value))
    return new TypeValidationError(err)

  if (!skipSelf && value != null && shape)
    value = validateShape(shape, value, context, onlyShapeKeys)

  if (is(value, Error))
    return value

  if (is(value, Promise))
    return value.then(resolved => validateObject(resolved, context, config, true))

  return validators && validators.length > 0
    ? validate(validators, value, context.safe())
    : value
}

/******************************************************************************/
// Main
/******************************************************************************/

function object (...args) {

  const config = objectConfig(args)

  config.shape = normalizeShape(config.shape)
  config.validators = config.validators.map(normalizeValidator)
  config.err = config.err || `Must be an Object`
  if ('onlyShapeKeys' in config === false)
    config.onlyShapeKeys = !!config.shape

  const object = (value, context) => validateObject(value, context, config)

  object[TYPE] = 'Object'

  return object
}

object[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default object

export { normalizeValidator }

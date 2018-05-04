import { OPTIONAL_CONFIG, TYPE, TYPE_TEST_ONLY } from '../util/symbols'
import argsToConfig from '../util/args-to-config'
import normalizeValidator from '../util/normalize-validator'

import validate from '../validate'
import is from 'is-explicit'

import { castToType } from './type-of'

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

function validateShape (shape, obj, context) {

  let async

  for (const key in shape) {

    const result = validate(shape[key], obj[key], context.push(key))

    if (result instanceof Promise) {
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

        obj[key] = result
      }

      return obj
    })

}

function validateObject (value, context, config, skipSelf = false) {

  const { validators, cast, shape, err } = config

  const testOnly = context === TYPE_TEST_ONLY
  const testResult = value == null || is.plainObject(value)
  if (testOnly)
    return testResult

  if (!skipSelf)
    value = validate(validators, value, context)

  if (value instanceof Promise)
    return value
      .then(resolvedValue => validateObject(resolvedValue, context, config, true))

  if (value != null || !is.plainObject(value)) {

    value = castToType(value, cast, Object)

    if (!is.plainObject(value))
      return new Error(
        err || `Must be of type: Object`
      )
  }

  return shape && value
    ? validateShape(shape, value, context)
    : value

}

/******************************************************************************/
// Main
/******************************************************************************/

function object (...args) {

  const config = objectConfig(args)

  config.shape = normalizeShape(config.shape)
  config.validators = config.validators.map(normalizeValidator)

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

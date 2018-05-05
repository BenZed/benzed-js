import is from 'is-explicit'

import object from '../types/object'
import arrayOf from '../types/array-of'

import reduceValidator from './reduce-validator'

/******************************************************************************/
// Main
/******************************************************************************/

function normalizeValidator (validator) {

  const isArray = is(validator, Array)

  if (isArray && validator.length === 0)
    throw new Error('validator can not be defined as an empty array')

  if (isArray)
    validator = arrayOf(...validator.map(normalizeValidator))

  if (is.plainObject(validator))
    validator = object({ shape: validator })

  if (!is(validator, Function))
    throw new Error('validators must be defined as arrays, objects or functions')

  validator = reduceValidator(validator)

  return validator
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default normalizeValidator

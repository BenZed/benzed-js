import is from 'is-explicit'

import object from '../types/object'
import arrayOf from '../types/array-of'

import reduceValidator from './reduce-validator'

/******************************************************************************/
// Main
/******************************************************************************/

function normalizeValidator (validator) {

  if (validator instanceof Array)
    validator = arrayOf(...validator)

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

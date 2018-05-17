import is from 'is-explicit'

import { OPTIONAL_CONFIG } from '../util/symbols'

/******************************************************************************/
// Helper
/******************************************************************************/

function reduceValidator (validator) {

  if (is(validator, Array))
    return validator.map(reduceValidator)

  while (OPTIONAL_CONFIG in validator) {
    validator = validator()

    if (!is(validator, Function))
      throw new Error('validators with OPTIONAL_CONFIG enabled must return a function')
  }

  return validator
}

/******************************************************************************/
// Resolve Circular Dependencies
/******************************************************************************/

let object, arrayOf

function rcd ([ to ]) {
  return require('../types/' + to).default
}

/******************************************************************************/
// Main
/******************************************************************************/

function normalizeValidator (validator, ...args) {

  const isArray = is(validator, Array)

  if (isArray && validator.length === 0)
    throw new Error('validator can not be defined as an empty array')

  if (isArray) {
    arrayOf = arrayOf || rcd`array-of`
    validator = arrayOf(...validator.map(normalizeValidator), ...args)
  }

  if (is.plainObject(validator)) {
    object = object || rcd`object`
    validator = args.length === 0
      ? object({ shape: validator })
      : object(validator, ...args)
  }

  if (!is(validator, Function))
    throw new Error('validators must be defined as arrays, objects or functions')

  validator = reduceValidator(validator)

  return validator
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default normalizeValidator

import { OPTIONAL_CONFIG } from './symbols'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function reduceValidator (validator) {

  while (OPTIONAL_CONFIG in validator) {
    validator = validator()

    if (!is(validator, Function))
      throw new Error('validators with OPTIONAL_CONFIG enabled must return a function')
  }

  return validator
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default reduceValidator

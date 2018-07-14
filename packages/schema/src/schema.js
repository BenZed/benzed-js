import normalizeValidator from './util/normalize-validator'
import Context from './util/context'
import validate from './util/validate'
import { TYPE } from './util/symbols'

import { copy } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Higher order function for creating validators.
 *
 * @param  {*} ...args Schema definition arguments.
 * @return {Function}  Validation function.
 */
function Schema (raw, ...args) {

  const normalized = normalizeValidator(raw, ...args)

  if (TYPE in normalized === false)
    throw new Error('Schema must be defined with a type function, or an array or plain object thereof')

  return function validator (data, ...args) {

    const context = new Context(data, args)

    return validate(normalized, copy(data), context)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

import { Context, normalizeValidator, TYPE } from './util'

import { copy } from '@benzed/immutable'

import validate from './validate'

/******************************************************************************/
// Interface
/******************************************************************************/

function Schema (raw) {

  const normalized = normalizeValidator(raw)

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

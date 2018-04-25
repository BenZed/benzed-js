import is from 'is-explicit'
import { normalizeDefinition } from './util'

import { copy } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import { validate, createContext } from './validate'

/******************************************************************************/
// Helper
/******************************************************************************/

function wrapValidator (def, path) {

  const validator = (data, ...args) => {

    const context = createContext(data, args, path)

    return validate(def, copy(data), context)
  }

  // Extend vadidator to have sub validators for each sub property
  if (is.plainObject(def))
    for (const key in def)
      validator[key in validator ? '_' + key : key] = wrapValidator(def[key])

  return validator

}

/******************************************************************************/
// Interface
/******************************************************************************/

function Schema (raw, path) {

  if (is(path) && !is(path, String) && !is.arrayOf(path, String))
    throw new Error('path argument must be a string or array of strings')

  path = path ? wrap(path) : []

  const normalized = normalizeDefinition(raw)

  return wrapValidator(normalized, path)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

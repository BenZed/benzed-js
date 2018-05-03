import is from 'is-explicit'

import { Context, reduceValidator, TYPE } from './util'

import { copy } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import { normalizeValidator } from './types/object'

import validate from './validate'

/******************************************************************************/
// Interface
/******************************************************************************/

function Schema (raw, path) {

  if (is(path) && !is(path, String) && !is.arrayOf(path, String))
    throw new Error('path argument must be a string or array of strings')

  path = path ? wrap(path) : []

  const normalized = normalizeValidator(raw)

  return function validator (data, ...args) {

    const context = new Context(data, args, path)

    return validate(normalized, copy(data), context)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

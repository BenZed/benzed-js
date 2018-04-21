import is from 'is-explicit'
import { normalizeDefinition, ValidationError, SKIP, SELF } from './util'

import { copy } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

function validate (funcs, input, context) {

  let output

  if (funcs instanceof Array) for (const func of funcs) {

    const result = func(input, context)
    if (result === SKIP)
      break

    if (result instanceof Error)
      throw new ValidationError(context.path, result.message)

    output = result

  } else { // otherwise it will be an object

    if (SELF in funcs)
      input = validate(funcs[SELF], input, context)

    if (is.plainObject(input)) for (const key in funcs) {

      context.path = [ ...context.path, key ]

      const result = validate(
        funcs[key],
        input[key],
        context
      )

      if (result === undefined)
        continue

      output = output || {}
      output[key] = result

    }

  }

  return output

}

/******************************************************************************/
// Helper
/******************************************************************************/

function wrapValidator (def, path) {

  function validator (data, ...args) {

    const context = {
      data,
      args,
      path: copy(path)
    }

    return validate(def, copy(data), context)
  }

  const isPlainObject = is.plainObject(def)
  if (isPlainObject) for (const key in def)
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

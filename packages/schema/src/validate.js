import is from 'is-explicit'
import { ValidationError, SKIP, SELF } from './util'

import { copy } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

function createContext (data, args, path) {
  return {
    data,
    args,
    path: copy(path)
  }
}

function validateObject (fobj, data, context, skipSelf) {

  let promises

  if (!skipSelf && SELF in fobj) {
    const result = validate(fobj[SELF], data, context)
    if (result instanceof Promise)
      return result.then(value => validateObject(fobj, value, context, true))
    else
      data = result
  }

  if (is.plainObject(data)) for (const key in fobj) {

    context.path = [ ...context.path, key ]

    const result = validate(fobj[key], data[key], context)

    if (result instanceof Promise) {
      promises = promises || { keys: [], results: [] }
      promises.keys.push(key)
      promises.results.push(result)

    } else if (result !== undefined)
      data[key] = result

  }

  if (!promises)
    return data

  return Promise
    .all(promises.results)
    .then(resolved => {
      for (let i = 0; i < promises.keys.length; i++) {
        const key = promises.keys[i]
        data[key] = resolved[i]
      }

      return data
    })

}

function validateArray (funcs, value, context, index = 0) {

  for (let i = index; i < funcs.length; i++) {

    const func = funcs[i]
    const result = func(value, context)

    if (result instanceof Promise)
      return result
        .then(value => validateArray(funcs, value, context, i + 1))
        .catch(err => { throw new ValidationError(context.path, err.message) })

    if (result === SKIP)
      break

    if (result instanceof Error)
      throw new ValidationError(context.path, result.message)

    value = result
  }

  return value

}

/******************************************************************************/
// Main
/******************************************************************************/

function validate (funcs, input, context) {

  return funcs instanceof Array
    ? validateArray(funcs, input, context)
    : validateObject(funcs, input, context)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validate

export { validate, createContext }
